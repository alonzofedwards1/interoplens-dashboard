import React from 'react';

import { CommitteeQueueItem } from '../features/committee/data/committeeQueue.data';
import { Finding } from '../types/findings';
import type { MessageEvent } from '../types/messages';
import { PdExecution } from '../types/pdExecutions';
import { apiClient, ApiClient, IntegrationHealthResponse } from './apiClient';

interface ServerDataContextType {
    findings: Finding[];
    pdExecutions: PdExecution[];
    committeeQueue: CommitteeQueueItem[];
    messages: MessageEvent[];

    integrationHealth?: IntegrationHealthResponse;

    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

const ServerDataContext =
    React.createContext<ServerDataContextType | undefined>(undefined);

const fetchMessages = async (): Promise<MessageEvent[]> => {
    const token = localStorage.getItem('authToken') ?? localStorage.getItem('token') ?? '';

    const response = await fetch('/api/messages', {
        method: 'GET',
        credentials: 'include',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to load messages (${response.status})`);
    }

    const data = (await response.json()) as unknown;
    if (!Array.isArray(data)) {
        throw new Error('Unexpected messages response format');
    }

    return data as MessageEvent[];
};

const loadFromApi = async (client: ApiClient) => {
    const [
        findingsResult,
        pdExecutionsResult,
        committeeQueueResult,
        messagesResult,
        integrationHealthResult,
    ] = await Promise.allSettled([
        client.getFindings(),
        client.getPdExecutions(),
        client.getCommitteeQueue(),
        fetchMessages(),
        client.getIntegrationHealth(),
    ]);

    const findings = findingsResult.status === 'fulfilled' ? findingsResult.value : [];

    const pdExecutions =
        pdExecutionsResult.status === 'fulfilled' ? pdExecutionsResult.value : [];

    const committeeQueue =
        committeeQueueResult.status === 'fulfilled' ? committeeQueueResult.value : [];

    const messages = messagesResult.status === 'fulfilled' ? messagesResult.value : [];

    const integrationHealth =
        integrationHealthResult.status === 'fulfilled'
            ? integrationHealthResult.value
            : undefined;

    if (integrationHealthResult.status === 'rejected') {
        console.warn(
            '[ServerDataContext] Integration health unavailable',
            integrationHealthResult.reason
        );
    }

    const errors = [findingsResult, pdExecutionsResult].filter(
        r => r.status === 'rejected'
    ) as PromiseRejectedResult[];

    return {
        findings,
        pdExecutions,
        committeeQueue,
        messages,
        integrationHealth,
        error:
            errors.length > 0
                ? errors
                    .map(e =>
                        e.reason instanceof Error
                            ? e.reason.message
                            : String(e.reason)
                    )
                .join(' | ')
                : null,
    };
};

export const ServerDataProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [state, setState] = React.useState({
        findings: [] as Finding[],
        pdExecutions: [] as PdExecution[],
        committeeQueue: [] as CommitteeQueueItem[],
        messages: [] as MessageEvent[],
        integrationHealth: undefined as IntegrationHealthResponse | undefined,
        loading: true,
        error: null as string | null,
    });

    const refresh = React.useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const data = await loadFromApi(apiClient);
            setState(prev => ({ ...prev, ...data }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : String(error),
            }));
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    }, []);

    React.useEffect(() => {
        refresh();
    }, [refresh]);

    return (
        <ServerDataContext.Provider value={{ ...state, refresh }}>
            {children}
        </ServerDataContext.Provider>
    );
};

export const useServerData = () => {
    const ctx = React.useContext(ServerDataContext);
    if (!ctx) {
        throw new Error('useServerData must be used within a ServerDataProvider');
    }
    return ctx;
};
