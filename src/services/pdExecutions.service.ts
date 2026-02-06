import {
    CertificateHealthSummary,
    PdExecution,
    PdExecutionCounts,
    PdExecutionHealthSummary,
    PdExecutionsResponse,
} from '../types/pdExecutions';
import { requestJson } from '../lib/api/request';

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

export const fetchPdExecutions = async (
    params?: FetchParams
): Promise<PdExecutionsResponse> => {
    return requestJson<PdExecutionsResponse>(
        `/api/pd-executions${buildQueryString(params)}`,
        { method: 'GET' }
    );
};

export const fetchPdExecutionCounts = async (): Promise<PdExecutionCounts> => {
    return requestJson<PdExecutionCounts>('/api/pd-executions/count', {
        method: 'GET',
    });
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

export const normalizeCertificateHealth = (
    summary?: CertificateHealthSummary
): CertificateHealthSummary | undefined => {
    if (!summary) return undefined;
    return {
        expired: summary.expired ?? 0,
        expiringSoon: summary.expiringSoon ?? 0,
        valid: summary.valid ?? 0,
    };
};
