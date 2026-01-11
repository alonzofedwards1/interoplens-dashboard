// src/data/pdExecutions.data.ts

export type PDOutcome = 'success' | 'failure';

export interface PDExecution {
    requestId: string;
    startedAt: string;
    completedAt: string;
    executionTimeMs: number;
    outcome: PDOutcome;
    channelId: string;
    environment: string;
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
        startedAt: '2025-12-18T14:04:20Z',
        completedAt: '2025-12-18T14:05:00Z',
        executionTimeMs: 412,
        outcome: 'success',
        channelId: 'mirth-pd-01',
        environment: 'prod',
    },
    {
        requestId: 'req-002',
        startedAt: '2025-12-18T13:41:20Z',
        completedAt: '2025-12-18T13:42:00Z',
        executionTimeMs: 365,
        outcome: 'success',
        channelId: 'mirth-pd-02',
        environment: 'prod',
    },
    {
        requestId: 'req-003',
        startedAt: '2025-12-18T12:20:30Z',
        completedAt: '2025-12-18T12:22:00Z',
        executionTimeMs: 745,
        outcome: 'failure',
        channelId: 'mirth-pd-03',
        environment: 'test',
    },
    {
        requestId: 'req-004',
        startedAt: '2025-12-18T10:29:30Z',
        completedAt: '2025-12-18T10:30:00Z',
        executionTimeMs: 430,
        outcome: 'success',
        channelId: 'mirth-pd-04',
        environment: 'prod',
    },
    {
        requestId: 'req-005',
        startedAt: '2025-12-18T08:34:10Z',
        completedAt: '2025-12-18T08:35:00Z',
        executionTimeMs: 510,
        outcome: 'failure',
        channelId: 'mirth-pd-05',
        environment: 'test',
    },
    {
        requestId: 'req-006',
        startedAt: '2025-12-18T05:30:10Z',
        completedAt: '2025-12-18T05:31:00Z',
        executionTimeMs: 612,
        outcome: 'success',
        channelId: 'mirth-pd-06',
        environment: 'prod',
    },
];
