import { CommitteeStatus } from './committeeStatus';

export interface CommitteeQueueItem {
    id: string;
    organization: string;
    issueType: string;
    severity: 'Critical' | 'Warning' | 'Ok';
    evidenceTrigger: string;
    submitted: string;
    decisionTarget: string;
    status: CommitteeStatus;
}

export const committeeQueueData: CommitteeQueueItem[] = [
    {
        id: 'FND-1028',
        organization: 'Cleveland Clinic',
        issueType: 'Early Signal Review',
        severity: 'Warning',
        evidenceTrigger: 'Emerging PD latency variance',
        submitted: '2025-12-13',
        decisionTarget: '2025-12-21',
        status: 'In Committee',
    },
    {
        id: 'FND-1029',
        organization: 'Mount Sinai Health System',
        issueType: 'Certificate Expiry',
        severity: 'Critical',
        evidenceTrigger: 'Certificate expires in < 7 days',
        submitted: '2025-12-12',
        decisionTarget: '2025-12-19',
        status: 'Decision Required',
    },
    {
        id: 'FND-1034',
        organization: 'Intermountain Healthcare',
        issueType: 'Abnormal PD Volume Spike',
        severity: 'Critical',
        evidenceTrigger: '4× baseline Patient Discovery volume',
        submitted: '2025-12-11',
        decisionTarget: '2025-12-18',
        status: 'Decision Made',
    },
    {
        id: 'FND-1041',
        organization: 'VA Puget Sound',
        issueType: 'Repeated Query Failures',
        severity: 'Critical',
        evidenceTrigger: 'Failure rate > 30% for 48 hours',
        submitted: '2025-12-10',
        decisionTarget: '2025-12-17',
        status: 'Resolved',
    },
];
