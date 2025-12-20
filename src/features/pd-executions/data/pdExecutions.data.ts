// src/data/pdExecutions.data.ts

export type PDOutcome =
    | 'success'
    | 'multiple-matches'
    | 'no-match'
    | 'error';

export interface PDExecution {
    id: string;
    organization: string;          // Exchange participant (VA, DoD, etc.)
    environment: 'dev' | 'test' | 'prod';
    qhin: string;                   // Executing QHIN
    outcome: PDOutcome;
    executionTimeMs: number;        // Latency
    requestTimestamp: string;       // ISO string
    patientAgeRange: '0-17' | '18-39' | '40-64' | '65+';
    retryCount: number;
    correlatedFindingId?: string;   // Links to findings when applicable
}

/**
 * Canonical PD Execution Dataset
 * Used by:
 * - PD Executions Page
 * - Dashboard PD metrics
 * - Hourly outcome charts
 * - CommitteeQueue / anomaly correlation
 */
export const pdExecutionsData: PDExecution[] = [
    // -----------------------------
    // VA – PROD
    // -----------------------------
    {
        id: 'PD-001',
        organization: 'VA',
        environment: 'prod',
        qhin: 'CommonWell',
        outcome: 'success',
        executionTimeMs: 412,
        requestTimestamp: '2025-12-18T14:05:00Z',
        patientAgeRange: '65+',
        retryCount: 0
    },
    {
        id: 'PD-002',
        organization: 'VA',
        environment: 'prod',
        qhin: 'CommonWell',
        outcome: 'multiple-matches',
        executionTimeMs: 980,
        requestTimestamp: '2025-12-18T14:06:00Z',
        patientAgeRange: '40-64',
        retryCount: 1,
        correlatedFindingId: 'F-001'
    },
    {
        id: 'PD-003',
        organization: 'VA',
        environment: 'prod',
        qhin: 'CommonWell',
        outcome: 'error',
        executionTimeMs: 0,
        requestTimestamp: '2025-12-18T14:07:00Z',
        patientAgeRange: '18-39',
        retryCount: 3,
        correlatedFindingId: 'F-004'
    },

    // -----------------------------
    // DoD – PROD
    // -----------------------------
    {
        id: 'PD-004',
        organization: 'DoD',
        environment: 'prod',
        qhin: 'Carequality',
        outcome: 'success',
        executionTimeMs: 365,
        requestTimestamp: '2025-12-18T13:42:00Z',
        patientAgeRange: '18-39',
        retryCount: 0
    },
    {
        id: 'PD-005',
        organization: 'DoD',
        environment: 'prod',
        qhin: 'Carequality',
        outcome: 'no-match',
        executionTimeMs: 510,
        requestTimestamp: '2025-12-18T13:43:00Z',
        patientAgeRange: '0-17',
        retryCount: 0
    },
    {
        id: 'PD-006',
        organization: 'DoD',
        environment: 'prod',
        qhin: 'Carequality',
        outcome: 'error',
        executionTimeMs: 0,
        requestTimestamp: '2025-12-18T13:44:00Z',
        patientAgeRange: '65+',
        retryCount: 2,
        correlatedFindingId: 'F-006'
    },

    // -----------------------------
    // Mayo Clinic – TEST
    // -----------------------------
    {
        id: 'PD-007',
        organization: 'Mayo Clinic',
        environment: 'test',
        qhin: 'CommonWell',
        outcome: 'success',
        executionTimeMs: 288,
        requestTimestamp: '2025-12-18T12:21:00Z',
        patientAgeRange: '40-64',
        retryCount: 0
    },
    {
        id: 'PD-008',
        organization: 'Mayo Clinic',
        environment: 'test',
        qhin: 'CommonWell',
        outcome: 'multiple-matches',
        executionTimeMs: 745,
        requestTimestamp: '2025-12-18T12:22:00Z',
        patientAgeRange: '65+',
        retryCount: 1,
        correlatedFindingId: 'F-001'
    },

    // -----------------------------
    // Kaiser – PROD
    // -----------------------------
    {
        id: 'PD-009',
        organization: 'Kaiser Permanente',
        environment: 'prod',
        qhin: 'Carequality',
        outcome: 'success',
        executionTimeMs: 398,
        requestTimestamp: '2025-12-18T11:10:00Z',
        patientAgeRange: '18-39',
        retryCount: 0
    },
    {
        id: 'PD-010',
        organization: 'Kaiser Permanente',
        environment: 'prod',
        qhin: 'Carequality',
        outcome: 'multiple-matches',
        executionTimeMs: 880,
        requestTimestamp: '2025-12-18T11:11:00Z',
        patientAgeRange: '40-64',
        retryCount: 1,
        correlatedFindingId: 'F-005'
    },

    // -----------------------------
    // Mount Sinai – PROD (Certificate risk)
    // -----------------------------
    {
        id: 'PD-011',
        organization: 'Mount Sinai Health System',
        environment: 'prod',
        qhin: 'CommonWell',
        outcome: 'success',
        executionTimeMs: 430,
        requestTimestamp: '2025-12-18T10:30:00Z',
        patientAgeRange: '65+',
        retryCount: 0,
        correlatedFindingId: 'FND-1029'
    },
    {
        id: 'PD-012',
        organization: 'Mount Sinai Health System',
        environment: 'prod',
        qhin: 'CommonWell',
        outcome: 'error',
        executionTimeMs: 0,
        requestTimestamp: '2025-12-18T10:32:00Z',
        patientAgeRange: '40-64',
        retryCount: 2,
        correlatedFindingId: 'FND-1029'
    },

    // -----------------------------
    // Intermountain – PROD (Retry loop)
    // -----------------------------
    {
        id: 'PD-013',
        organization: 'Intermountain Healthcare',
        environment: 'prod',
        qhin: 'Carequality',
        outcome: 'error',
        executionTimeMs: 0,
        requestTimestamp: '2025-12-18T09:48:00Z',
        patientAgeRange: '18-39',
        retryCount: 3,
        correlatedFindingId: 'FND-1034'
    },
    {
        id: 'PD-014',
        organization: 'Intermountain Healthcare',
        environment: 'prod',
        qhin: 'Carequality',
        outcome: 'multiple-matches',
        executionTimeMs: 970,
        requestTimestamp: '2025-12-18T09:49:00Z',
        patientAgeRange: '40-64',
        retryCount: 1,
        correlatedFindingId: 'FND-1034'
    },

    // -----------------------------
    // VA Puget Sound – TEST (Repeated failures)
    // -----------------------------
    {
        id: 'PD-015',
        organization: 'VA Puget Sound',
        environment: 'test',
        qhin: 'CommonWell',
        outcome: 'error',
        executionTimeMs: 0,
        requestTimestamp: '2025-12-18T09:10:00Z',
        patientAgeRange: '65+',
        retryCount: 4,
        correlatedFindingId: 'FND-1041'
    },
    {
        id: 'PD-016',
        organization: 'VA Puget Sound',
        environment: 'test',
        qhin: 'CommonWell',
        outcome: 'success',
        executionTimeMs: 390,
        requestTimestamp: '2025-12-18T09:12:00Z',
        patientAgeRange: '0-17',
        retryCount: 0,
        correlatedFindingId: 'FND-1041'
    }
];
