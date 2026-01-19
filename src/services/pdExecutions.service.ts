import {
    PdExecution,
    PdExecutionCounts,
    PdExecutionHealthSummary,
    PdExecutionsResponse,
} from '../types/pdExecutions';
import { authFetch } from '../lib/api/auth';
import { safeJson } from '../lib/api/utils';

type FetchParams = Record<string, string | number | boolean | undefined>;

const buildQueryString = (params?: FetchParams) => {
    if (!params) return '';
    const entries = Object.entries(params).filter(
        ([, value]) => value !== undefined
    );
    if (!entries.length) return '';
    const searchParams = new URLSearchParams();
    entries.forEach(([key, value]) => {
        searchParams.set(key, String(value));
    });
    return `?${searchParams.toString()}`;
};

const assertOk = async (response: Response) => {
    if (!response.ok) {
        let message = `${response.status} ${response.statusText}`;
        try {
            const data = await safeJson(response.clone());
            if (data && typeof data === 'object' && 'message' in data) {
                message = String(
                    (data as { message?: string }).message ?? message
                );
            }
        } catch {
            // Ignore JSON parsing errors
        }
        throw new Error(message);
    }
};

export const fetchPdExecutions = async (
    params?: FetchParams
): Promise<PdExecutionsResponse> => {
    const response = await authFetch(
        `/api/pd-executions${buildQueryString(params)}`,
        { method: 'GET' }
    );
    await assertOk(response);
    return (await safeJson(response)) as PdExecutionsResponse;
};

export const fetchPdExecutionCounts = async (): Promise<PdExecutionCounts> => {
    const response = await authFetch('/api/pd-executions/count', {
        method: 'GET',
    });
    await assertOk(response);
    return (await safeJson(response)) as PdExecutionCounts;
};

export const fetchExecutionHealthSummary = async (
    params?: FetchParams
): Promise<PdExecutionHealthSummary> => {
    const executions = await fetchPdExecutions(params);

    const summary = executions.reduce<PdExecutionHealthSummary>(
        (acc, execution: PdExecution) => {
            acc.total += 1;
            if (execution.outcome === 'success') acc.success += 1;
            if (execution.outcome === 'failure') acc.failure += 1;
            if (execution.outcome === 'partial') {
                acc.partial = (acc.partial ?? 0) + 1;
            }
            if (execution.outcome === 'failure') {
                const rootCause = execution.rootCause ?? 'Unspecified';
                acc.byRootCause[rootCause] =
                    (acc.byRootCause[rootCause] ?? 0) + 1;
            }
            return acc;
        },
        {
            total: 0,
            success: 0,
            failure: 0,
            partial: 0,
            byRootCause: {},
        }
    );

    if (summary.partial === 0) {
        delete summary.partial;
    }

    return summary;
};
