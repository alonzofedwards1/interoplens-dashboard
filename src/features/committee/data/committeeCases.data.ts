import { CommitteeStatus } from './committeeStatus';

export interface EvidenceItem {
    title: string;
    description: string;
}

export interface LinkedFinding {
    id: string;
    type: string;
    date: string;
    severity: 'Critical' | 'Warning' | 'Ok';
}

export interface CommitteeCase {
    id: string;
    organization: string;
    severity: 'Critical' | 'Warning' | 'Ok';
    status: CommitteeStatus;
    decisionTarget: string;

    committeeReason: string;
    issueType: string;
    firstDetected: string;
    escalationTrigger: string;
    affectedParties: string[];

    evidence: EvidenceItem[];
    linkedFindings: LinkedFinding[];

    decisionOptions: string[];
    selectedDecision?: string;
}

export const committeeCasesData: CommitteeCase[] = [
    /* ======================================================
       IN COMMITTEE — NO BUTTONS (DISCUSSION ONLY)
       ====================================================== */
    {
        id: 'FND-1028',
        organization: 'Cleveland Clinic',
        severity: 'Warning',
        status: 'In Committee',
        decisionTarget: '2025-12-21',

        committeeReason:
            'Early indicators suggest potential Patient Discovery latency instability',
        issueType: 'Early Signal Review',
        firstDetected: '2025-12-13',
        escalationTrigger: 'Emerging PD latency variance',
        affectedParties: ['Cleveland Clinic'],

        evidence: [
            {
                title: 'Latency Drift',
                description:
                    'Gradual increase in Patient Discovery response time over baseline',
            },
        ],

        linkedFindings: [
            {
                id: 'FND-1028',
                type: 'Patient Discovery',
                date: '2025-12-13',
                severity: 'Warning',
            },
        ],

        decisionOptions: [
            'Continue monitoring',
            'Request additional telemetry',
        ],
    },

    /* ======================================================
       DECISION REQUIRED — SAVE + MARK DECISION MADE
       ====================================================== */
    {
        id: 'FND-1029',
        organization: 'Mount Sinai Health System',
        severity: 'Critical',
        status: 'Decision Required',
        decisionTarget: '2025-12-19',

        committeeReason:
            'Impending certificate expiration creates cross-partner trust risk',
        issueType: 'Certificate Expiry',
        firstDetected: '2025-12-12',
        escalationTrigger: 'Certificate expires in < 7 days',
        affectedParties: [
            'Mount Sinai Health System',
            'External Trading Partners',
        ],

        evidence: [
            {
                title: 'Certificate Expiry Window',
                description:
                    'Production certificate scheduled to expire within governance risk window',
            },
        ],

        linkedFindings: [
            {
                id: 'FND-1029',
                type: 'Certificate Health',
                date: '2025-12-12',
                severity: 'Critical',
            },
        ],

        decisionOptions: [
            'Require immediate certificate rotation',
            'Accept short-term risk with monitoring',
            'Coordinate planned rotation with partners',
        ],
    },

    /* ======================================================
       DECISION MADE — RESOLVE CASE
       ====================================================== */
    {
        id: 'FND-1034',
        organization: 'Intermountain Healthcare',
        severity: 'Critical',
        status: 'Decision Made',
        decisionTarget: '2025-12-18',

        committeeReason:
            'Abnormal Patient Discovery volume suggests retry loop or misconfiguration',
        issueType: 'Abnormal PD Volume Spike',
        firstDetected: '2025-12-11',
        escalationTrigger: '4× baseline Patient Discovery volume',
        affectedParties: [
            'Intermountain Healthcare',
            'Responding Trading Partners',
        ],

        evidence: [
            {
                title: 'PD Volume Spike',
                description:
                    'Patient Discovery volume exceeded historical baseline by a factor of four',
            },
            {
                title: 'Retry Pattern',
                description:
                    'Repeated PD requests observed with minimal demographic variance',
            },
        ],

        linkedFindings: [
            {
                id: 'FND-1034',
                type: 'Patient Discovery',
                date: '2025-12-11',
                severity: 'Critical',
            },
        ],

        decisionOptions: [
            'Require PD retry logic review',
            'Temporarily rate-limit PD requests',
            'Accept behavior as expected workload increase',
        ],

        selectedDecision: 'Require PD retry logic review',
    },

    /* ======================================================
       RESOLVED — GENERATE KNOWLEDGE BASE ARTICLE
       ====================================================== */
    {
        id: 'FND-1041',
        organization: 'VA Puget Sound',
        severity: 'Critical',
        status: 'Resolved',
        decisionTarget: '2025-12-17',

        committeeReason:
            'Cross-organization trust ambiguity impacting Patient Discovery reliability',
        issueType: 'Repeated Query Failures',
        firstDetected: '2025-12-10',
        escalationTrigger: 'Failure rate > 30% for 48 hours',
        affectedParties: [
            'VA Puget Sound',
            'External Trading Partners',
        ],

        evidence: [
            {
                title: 'PD Failure Trend',
                description:
                    'Sustained elevated Patient Discovery failure rate across multiple days',
            },
            {
                title: 'Certificate Chain Validation',
                description:
                    'Inconsistent trust chain enforcement observed across partners',
            },
        ],

        linkedFindings: [
            {
                id: 'FND-1041',
                type: 'Patient Discovery',
                date: '2025-12-05',
                severity: 'Critical',
            },
        ],

        decisionOptions: [
            'Enforce stricter certificate validation',
        ],

        selectedDecision: 'Enforce stricter certificate validation',
    },
];
