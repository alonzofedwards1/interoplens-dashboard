import React from 'react';
import { Finding } from '../types/findings';
import { PdExecution } from '../types/pdExecutions';
import { TelemetryEvent } from '../types/telemetry';
import { CommitteeQueueItem } from '../features/committee/data/committeeQueue.data';
import { apiClient, ApiClient, IntegrationHealthResponse } from './apiClient';

interface ServerDataContextValue {
    findings: Finding[];
    pdExecutions: PdExecution[];
    committeeQueue: CommitteeQueueItem[];
    telemetryEvents: TelemetryEvent[];

    // ✅ Integration Health (REAL DATA)
    integrationHealth?: IntegrationHealthResponse;

    loading: boolean;
    error?: string;
    telemetryWarning?: string;
    refresh: () => Promise<void>;
}

const ServerDataContext =
    React.createContext<ServerDataContextValue | undefined>(undefined);

/* ============================================================
   API LOADER
============================================================ */

const loadFromApi = async (client: ApiClient) => {
    const [
        findingsResult,
        pdExecutionsResult,
        committeeQueueResult,
        telemetryResult,
        integrationHealthResult,
    ] = await Promise.allSettled([
        client.getFindings(),
        client.getPdExecutions(),
        client.getCommitteeQueue(),
        client.getTelemetryEvents(),
        client.getIntegrationHealth(), // ✅ THIS WAS MISSING
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
        telemetryResult.status === 'fulfilled'
            ? telemetryResult.value
            : [];

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

    const telemetryWarning =
        telemetryResult.status === 'rejected'
            ? telemetryResult.reason instanceof Error
                ? telemetryResult.reason.message
                : String(telemetryResult.reason)
            : undefined;

    const errors = [findingsResult, pdExecutionsResult].filter(
        r => r.status === 'rejected'
    ) as PromiseRejectedResult[];

    return {
        findings,
        pdExecutions,
        committeeQueue,
        telemetryEvents,
        integrationHealth,
        telemetryWarning,
        error:
            errors.length > 0
                ? errors
                    .map(e =>
                        e.reason instanceof Error
                            ? e.reason.message
                            : String(e.reason)
                    )
                    .join(' | ')
                : undefined,
    };
};

/* ============================================================
   PROVIDER
============================================================ */

export const ServerDataProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                                children,
                                                                            }) => {
    const [state, setState] = React.useState({
        findings: [] as Finding[],
        pdExecutions: [] as PdExecution[],
        committeeQueue: [] as CommitteeQueueItem[],
        telemetryEvents: [] as TelemetryEvent[],
        integrationHealth: undefined as IntegrationHealthResponse | undefined,
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

/* ============================================================
   HOOK
============================================================ */

export const useServerData = () => {
    const ctx = React.useContext(ServerDataContext);
    if (!ctx) {
        throw new Error(
            'useServerData must be used within a ServerDataProvider'
        );
    }
    return ctx;
};
