// src/data/findings.data.ts

export type FindingSeverity = 'ok' | 'warning' | 'critical';
export type FindingStatus = 'compliant' | 'non-compliant';

export type FindingType =
    | 'PD'
    | 'Certificate'
    | 'Committee'
    | 'Execution'
    | 'Metadata';

export type TransactionType =
    | 'PD'
    | 'QD'
    | 'RD'
    | 'XDS.b'
    | 'FHIR'
    | 'CCDA'
    | 'Directory'
    | 'Subscriptions';

export interface Finding {
    id: string;
    organization: string;
    environment: 'dev' | 'test' | 'prod';
    type: FindingType;                 // Governance / category
    transaction?: TransactionType;     // ✅ Technical transaction context
    severity: FindingSeverity;
    status: FindingStatus;
    title: string;
    description: string;
    detectedAt: string;
    source: string;
}

/**
 * Canonical Findings Dataset
 * Governance + Technical Context (SME-aligned)
 */
export const findingsData: Finding[] = [
    // =============================
    // CRITICAL
    // =============================
    {
        id: 'F-001',
        organization: 'Mayo Clinic',
        environment: 'prod',
        type: 'PD',
        transaction: 'PD',
        severity: 'critical',
        status: 'non-compliant',
        title: 'Patient Discovery Surge Detected',
        description:
            'PD request volume exceeded baseline by 340% within a 20-minute window.',
        detectedAt: '2025-12-18T14:32:00Z',
        source: 'Interoplens Analyzer'
    },
    {
        id: 'F-002',
        organization: 'Kaiser Permanente',
        environment: 'prod',
        type: 'Certificate',
        transaction: 'Directory',
        severity: 'critical',
        status: 'non-compliant',
        title: 'Certificate Expired',
        description:
            'TLS certificate expired 3 days ago. Mutual TLS handshake failures observed.',
        detectedAt: '2025-12-18T06:10:00Z',
        source: 'Certificate Inspector'
    },
    {
        id: 'F-003',
        organization: 'Cleveland Clinic',
        environment: 'prod',
        type: 'Committee',
        severity: 'critical',
        status: 'non-compliant',
        title: 'CommitteeQueue Review Required',
        description:
            'Sustained non-standard exchange behavior triggered mandatory committee review.',
        detectedAt: '2025-12-17T21:45:00Z',
        source: 'Governance Rules Engine'
    },
    {
        id: 'F-004',
        organization: 'Intermountain Health',
        environment: 'test',
        type: 'Execution',
        transaction: 'XDS.b',
        severity: 'critical',
        status: 'non-compliant',
        title: 'Execution Failure Rate High',
        description:
            'XDS.b execution failures exceeded 25% over a rolling 1-hour window.',
        detectedAt: '2025-12-17T18:02:00Z',
        source: 'Execution Monitor'
    },
    {
        id: 'F-005',
        organization: 'Mass General Brigham',
        environment: 'prod',
        type: 'Metadata',
        transaction: 'XDS.b',
        severity: 'critical',
        status: 'non-compliant',
        title: 'Invalid Home Community ID',
        description:
            'Home Community ID does not match registered value. Requests rejected downstream.',
        detectedAt: '2025-12-16T15:28:00Z',
        source: 'Metadata Validator'
    },

    // =============================
    // WARNING
    // =============================
    {
        id: 'F-006',
        organization: 'Mayo Clinic',
        environment: 'prod',
        type: 'Certificate',
        transaction: 'XDS.b',
        severity: 'warning',
        status: 'compliant',
        title: 'Certificate Expiring Soon',
        description:
            'TLS certificate expires in 12 days. Renewal recommended.',
        detectedAt: '2025-12-18T11:00:00Z',
        source: 'Certificate Inspector'
    },
    {
        id: 'F-007',
        organization: 'Kaiser Permanente',
        environment: 'test',
        type: 'PD',
        transaction: 'PD',
        severity: 'warning',
        status: 'compliant',
        title: 'PD Volume Above Normal',
        description:
            'Patient Discovery request volume slightly above expected baseline.',
        detectedAt: '2025-12-17T16:40:00Z',
        source: 'Interoplens Analyzer'
    },
    {
        id: 'F-008',
        organization: 'Cleveland Clinic',
        environment: 'prod',
        type: 'PD',
        transaction: 'XDS.b',
        severity: 'warning',
        status: 'compliant',
        title: 'Intermittent Execution Delays',
        description:
            'XDS.b execution latency intermittently exceeded threshold.',
        detectedAt: '2025-12-17T13:18:00Z',
        source: 'Execution Monitor'
    },
    {
        id: 'F-009',
        organization: 'Intermountain Health',
        environment: 'test',
        type: 'Metadata',
        transaction: 'XDS.b',
        severity: 'warning',
        status: 'compliant',
        title: 'Deprecated Metadata Field Present',
        description:
            'Deprecated metadata field observed but did not impact execution.',
        detectedAt: '2025-12-16T22:05:00Z',
        source: 'Metadata Validator'
    },

    // =============================
    // OK
    // =============================
    {
        id: 'F-010',
        organization: 'Mass General Brigham',
        environment: 'prod',
        type: 'PD',
        transaction: 'PD',
        severity: 'ok',
        status: 'compliant',
        title: 'PD Activity Normal',
        description:
            'Patient Discovery request patterns within expected operating range.',
        detectedAt: '2025-12-18T15:00:00Z',
        source: 'Interoplens Analyzer'
    },
    {
        id: 'F-011',
        organization: 'Cleveland Clinic',
        environment: 'prod',
        type: 'Execution',
        transaction: 'XDS.b',
        severity: 'ok',
        status: 'compliant',
        title: 'Execution Health Stable',
        description:
            'XDS.b execution success rate stable over the last 24 hours.',
        detectedAt: '2025-12-18T14:00:00Z',
        source: 'Execution Monitor'
    },
    {
        id: 'F-012',
        organization: 'Mayo Clinic',
        environment: 'prod',
        type: 'Certificate',
        transaction: 'QD',
        severity: 'ok',
        status: 'compliant',
        title: 'Certificates Valid',
        description:
            'All certificates valid and within renewal window.',
        detectedAt: '2025-12-18T13:30:00Z',
        source: 'Certificate Inspector'
    },
    {
        id: 'F-013',
        organization: 'Intermountain Health',
        environment: 'prod',
        type: 'Metadata',
        transaction: 'XDS.b',
        severity: 'ok',
        status: 'compliant',
        title: 'Metadata Validated',
        description:
            'All required metadata fields validated successfully.',
        detectedAt: '2025-12-18T12:45:00Z',
        source: 'Metadata Validator'
    },
    {
        id: 'F-014',
        organization: 'Kaiser Permanente',
        environment: 'prod',
        type: 'Committee',
        severity: 'ok',
        status: 'compliant',
        title: 'No CommitteeQueue Review Required',
        description:
            'Exchange behavior well below governance thresholds.',
        detectedAt: '2025-12-18T11:20:00Z',
        source: 'Governance Rules Engine'
    }
];
