// src/data/pdExecutions.data.ts

export type PDOutcome = 'success' | 'failure';

export interface PDExecution {
    requestId: string;
    transactionType: 'PD' | 'DQ' | 'DR';
    direction: 'inbound' | 'outbound';
    startedAt: string;
    completedAt: string;
    durationMs: number;
    outcome: PDOutcome;
    retryCount: number;
    sourceEnvironment: string;
    qhinName?: string;
}

/**
 * Canonical PD Execution Dataset
 * Used by:
 * - PD Executions Page
 * - Dashboard PD metrics
 */
export const pdExecutionsData: PDExecution[] = [
    {
        requestId: 'req-001',
        transactionType: 'PD',
        direction: 'outbound',
        startedAt: '2025-12-18T14:04:20Z',
        completedAt: '2025-12-18T14:05:00Z',
        durationMs: 412,
        outcome: 'success',
        retryCount: 0,
        sourceEnvironment: 'prod',
        qhinName: 'mirth-pd-01',
    },
    {
        requestId: 'req-002',
        transactionType: 'PD',
        direction: 'outbound',
        startedAt: '2025-12-18T13:41:20Z',
        completedAt: '2025-12-18T13:42:00Z',
        durationMs: 365,
        outcome: 'success',
        retryCount: 0,
        sourceEnvironment: 'prod',
        qhinName: 'mirth-pd-02',
    },
    {
        requestId: 'req-003',
        transactionType: 'PD',
        direction: 'outbound',
        startedAt: '2025-12-18T12:20:30Z',
        completedAt: '2025-12-18T12:22:00Z',
        durationMs: 745,
        outcome: 'failure',
        retryCount: 1,
        sourceEnvironment: 'test',
        qhinName: 'mirth-pd-03',
    },
    {
        requestId: 'req-004',
        transactionType: 'PD',
        direction: 'outbound',
        startedAt: '2025-12-18T10:29:30Z',
        completedAt: '2025-12-18T10:30:00Z',
        durationMs: 430,
        outcome: 'success',
        retryCount: 0,
        sourceEnvironment: 'prod',
        qhinName: 'mirth-pd-04',
    },
    {
        requestId: 'req-005',
        transactionType: 'PD',
        direction: 'outbound',
        startedAt: '2025-12-18T08:34:10Z',
        completedAt: '2025-12-18T08:35:00Z',
        durationMs: 510,
        outcome: 'failure',
        retryCount: 2,
        sourceEnvironment: 'test',
        qhinName: 'mirth-pd-05',
    },
    {
        requestId: 'req-006',
        transactionType: 'PD',
        direction: 'outbound',
        startedAt: '2025-12-18T05:30:10Z',
        completedAt: '2025-12-18T05:31:00Z',
        durationMs: 612,
        outcome: 'success',
        retryCount: 0,
        sourceEnvironment: 'prod',
        qhinName: 'mirth-pd-06',
    },
];
