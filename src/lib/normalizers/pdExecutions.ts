import { PdExecution, RawPdExecution } from '../../types/pdExecutions';

const normalizeOutcome = (
    outcome: RawPdExecution['outcome']
): PdExecution['outcome'] => {
    const normalized = String(outcome ?? '').toLowerCase();
    if (normalized === 'success' || normalized === 'failure' || normalized === 'partial') {
        return normalized;
    }
    return 'failure';
};

const normalizeCertStatus = (
    certStatus: RawPdExecution['certStatus']
): PdExecution['certStatus'] | undefined => {
    if (!certStatus) return undefined;
    const normalized = String(certStatus).replace(/\s+/g, '_').toUpperCase();
    if (normalized === 'VALID' || normalized === 'EXPIRING_SOON' || normalized === 'EXPIRED') {
        return normalized;
    }
    return undefined;
};

const normalizeRequestId = (
    value: RawPdExecution['requestId'],
    fallbackIndex: number
): string => {
    if (typeof value === 'string' && value.trim().length > 0) return value;
    return `missing-request-id-${fallbackIndex}`;
};

export const normalizePdExecution = (
    raw: RawPdExecution,
    index = 0
): PdExecution => {
    return {
        requestId: normalizeRequestId(raw.requestId, index),
        transactionType: raw.transactionType ?? 'PD',
        direction: raw.direction ?? 'outbound',
        startedAt: raw.startedAt ?? '',
        completedAt: raw.completedAt ?? '',
        durationMs: raw.durationMs ?? raw.executionTimeMs ?? 0,
        outcome: normalizeOutcome(raw.outcome),
        rootCause: raw.rootCause,
        failureStage: raw.failureStage,
        httpStatus: raw.httpStatus,
        retryCount: raw.retryCount ?? 0,
        certStatus: normalizeCertStatus(raw.certStatus),
        certThumbprint: raw.certThumbprint,
        sourceEnvironment: raw.sourceEnvironment ?? raw.environment ?? '',
        qhinName: raw.qhinName ?? raw.sourceOrganizationName,
    };
};

export const normalizePdExecutions = (rows: RawPdExecution[]): PdExecution[] => {
    return rows.map((row, index) => normalizePdExecution(row, index));
};
