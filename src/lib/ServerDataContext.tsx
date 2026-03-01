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

interface ServerDataPayload {
    findings: Finding[];
    pdExecutions: PdExecution[];
    committeeQueue: CommitteeQueueItem[];
    messages: MessageEvent[];
    integrationHealth?: IntegrationHealthResponse;
}

const EMPTY_SERVER_DATA: ServerDataPayload = {
    findings: [],
    pdExecutions: [],
    committeeQueue: [],
    messages: [],
    integrationHealth: undefined,
};

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

const formatReason = (reason: unknown): string =>
    reason instanceof Error ? reason.message : String(reason);

const loadFromApi = async (
    client: ApiClient
): Promise<{ data: ServerDataPayload; error: string | null }> => {
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

    if (integrationHealthResult.status === 'rejected') {
        console.warn(
            '[ServerDataContext] Integration health unavailable',
            integrationHealthResult.reason
        );
    }

    const errorSources = [findingsResult, pdExecutionsResult].filter(
        result => result.status === 'rejected'
    ) as PromiseRejectedResult[];

    return {
        data: {
            findings: findingsResult.status === 'fulfilled' ? findingsResult.value : [],
            pdExecutions:
                pdExecutionsResult.status === 'fulfilled'
                    ? pdExecutionsResult.value
                    : [],
            committeeQueue:
                committeeQueueResult.status === 'fulfilled'
                    ? committeeQueueResult.value
                    : [],
            messages: messagesResult.status === 'fulfilled' ? messagesResult.value : [],
            integrationHealth:
                integrationHealthResult.status === 'fulfilled'
                    ? integrationHealthResult.value
                    : undefined,
        },
        error:
            errorSources.length > 0
                ? errorSources.map(result => formatReason(result.reason)).join(' | ')
                : null,
    };
};

export const ServerDataProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [data, setData] = React.useState<ServerDataPayload>(EMPTY_SERVER_DATA);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const refresh = React.useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await loadFromApi(apiClient);
            setData(response.data);
            setError(response.error);
        } catch (err) {
            setError(formatReason(err));
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        void refresh();
    }, [refresh]);

    const value = React.useMemo(
        () => ({ ...data, loading, error, refresh }),
        [data, loading, error, refresh]
    );

    return (
        <ServerDataContext.Provider value={value}>{children}</ServerDataContext.Provider>
    );
};

export const useServerData = () => {
    const ctx = React.useContext(ServerDataContext);
    if (!ctx) {
        throw new Error('useServerData must be used within a ServerDataProvider');
    }
    return ctx;
};
