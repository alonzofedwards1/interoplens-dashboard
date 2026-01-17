import React from 'react';
import { Finding } from '../types/findings';
import { PdExecution } from '../types/pdExecutions';
import { TelemetryEvent } from '../types/telemetry';
import { CommitteeQueueItem } from '../features/committee/data/committeeQueue.data';
import { apiClient, ApiClient } from './apiClient';
interface ServerDataContextValue {
    findings: Finding[];
    pdExecutions: PdExecution[];
    committeeQueue: CommitteeQueueItem[];
    telemetryEvents: TelemetryEvent[];
    loading: boolean;
    error?: string;
    telemetryWarning?: string;
    refresh: () => Promise<void>;
}

const ServerDataContext = React.createContext<ServerDataContextValue | undefined>(
    undefined
);

const loadFromApi = async (client: ApiClient) => {
    const [findingsResult, pdExecutionsResult, committeeQueueResult, telemetryResult] =
        await Promise.allSettled([
            client.getFindings(),
            client.getPdExecutions(),
            client.getCommitteeQueue(),
            client.getTelemetryEvents(),
        ]);

    const findings =
        findingsResult.status === 'fulfilled' ? findingsResult.value : [];
    const pdExecutions =
        pdExecutionsResult.status === 'fulfilled'
            ? pdExecutionsResult.value
            : [];
    const committeeQueue =
        committeeQueueResult.status === 'fulfilled'
            ? committeeQueueResult.value
            : [];
    const telemetryEvents =
        telemetryResult.status === 'fulfilled' ? telemetryResult.value : [];

    if (committeeQueueResult.status === 'rejected') {
        console.info('Committee queue not enabled', committeeQueueResult.reason);
    }

    const telemetryWarning =
        telemetryResult.status === 'rejected'
            ? (telemetryResult.reason instanceof Error
                  ? telemetryResult.reason.message
                  : String(telemetryResult.reason))
            : undefined;

    if (telemetryWarning) {
        console.warn('Telemetry unavailable', telemetryWarning);
    }

    const errors = [findingsResult, pdExecutionsResult].filter(
        result => result.status === 'rejected'
    ) as PromiseRejectedResult[];

    console.log('[ServerDataContext.loadFromApi] pdExecutions', {
        length: pdExecutions.length,
        sample: pdExecutions[0],
        errors: errors.map(err => err.reason),
    });

    return {
        findings,
        pdExecutions,
        committeeQueue,
        telemetryEvents,
        telemetryWarning,
        error:
            errors.length > 0
                ? errors
                      .map(err =>
                          err.reason instanceof Error
                              ? err.reason.message
                              : String(err.reason)
                      )
                      .join(' | ')
                : undefined,
    };
};

export const ServerDataProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [state, setState] = React.useState({
        findings: [] as Finding[],
        pdExecutions: [] as PdExecution[],
        committeeQueue: [] as CommitteeQueueItem[],
        telemetryEvents: [] as TelemetryEvent[],
        loading: true,
        error: undefined as string | undefined,
        telemetryWarning: undefined as string | undefined,
    });

    const refresh = React.useCallback(async () => {
        const data = await loadFromApi(apiClient);
        setState({ ...data, loading: false });
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
