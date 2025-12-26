import React from 'react';
import { Finding } from '../features/findings/data/findings.data';
import { PDExecution } from '../features/pd-executions/data/pdExecutions.data';
import { CommitteeQueueItem } from '../features/committee/data/committeeQueue.data';
import { apiClient, ApiClient } from './apiClient';
import {
    committeeQueueData as fixtureCommitteeQueue,
} from '../features/committee/data/committeeQueue.data';
import { findingsData as fixtureFindings } from '../features/findings/data/findings.data';
import { pdExecutionsData as fixturePdExecutions } from '../features/pd-executions/data/pdExecutions.data';
interface ServerDataContextValue {
    findings: Finding[];
    pdExecutions: PDExecution[];
    committeeQueue: CommitteeQueueItem[];
    telemetryEvents: TelemetryEvent[];
    loading: boolean;
    error?: string;
    refresh: () => Promise<void>;
}

const ServerDataContext = React.createContext<ServerDataContextValue | undefined>(
    undefined
);

const shouldUseFixtures = process.env.NODE_ENV === 'test';

const loadFromApi = async (client: ApiClient) => {
    const [findings, pdExecutions, committeeQueue, telemetryEvents] = await Promise.all([
        client.getFindings(),
        client.getPdExecutions(),
        client.getCommitteeQueue(),
        client.getTelemetryEvents(),
    ]);

    return { findings, pdExecutions, committeeQueue, telemetryEvents };
};

const loadFromFixtures = () => ({
    findings: fixtureFindings,
    pdExecutions: fixturePdExecutions,
    committeeQueue: fixtureCommitteeQueue,
    telemetryEvents: [] as TelemetryEvent[],
});

export const ServerDataProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [state, setState] = React.useState({
        findings: [] as Finding[],
        pdExecutions: [] as PDExecution[],
        committeeQueue: [] as CommitteeQueueItem[],
        telemetryEvents: [] as TelemetryEvent[],
        loading: true,
        error: undefined as string | undefined,
    });

    const refresh = React.useCallback(async () => {
        try {
            const data = shouldUseFixtures
                ? loadFromFixtures()
                : await loadFromApi(apiClient);
            setState({ ...data, loading: false, error: undefined });
        } catch (err) {
            const fallback = loadFromFixtures();
            setState({
                ...fallback,
                loading: false,
                error:
                    err instanceof Error
                        ? err.message
                        : 'Unable to load data from API',
            });
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
