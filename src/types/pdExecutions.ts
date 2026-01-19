export type PdExecution = {
    requestId: string;
    transactionType: 'PD' | 'DQ' | 'DR';
    direction: 'inbound' | 'outbound';
    startedAt: string;
    completedAt: string;
    durationMs: number;
    outcome: 'success' | 'failure' | 'partial';
    rootCause?: string;
    failureStage?: string;
    httpStatus?: number;
    retryCount: number;
    certThumbprint?: string;
    sourceEnvironment: string;
    qhinName?: string;
};

export type PdExecutionsResponse = PdExecution[];

export type PdExecutionCounts = {
    total: number;
    success: number;
    failure: number;
    partial?: number;
    certificateHealth?: CertificateHealthSummary;
};

export type PdExecutionHealthSummary = {
    total: number;
    success: number;
    failure: number;
    partial?: number;
    byRootCause: Record<string, number>;
};

export type CertificateHealthSummary = {
    expired: number;
    expiringSoon: number;
    valid: number;
};
