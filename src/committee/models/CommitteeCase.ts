import { CommitteeDecision } from './CommitteeDecision';

export type CommitteeStatus =
    | 'In Committee'
    | 'Decision Required'
    | 'Decision Made'
    | 'Resolved';

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

    issueType: string;
    committeeReason: string;
    escalationTrigger: string;

    firstDetected: string;
    decisionTarget: string;

    affectedParties: string[];

    evidence: EvidenceItem[];
    linkedFindings: LinkedFinding[];

    decisionOptions: string[];
    decision?: CommitteeDecision;

    createdAt?: string;
    updatedAt?: string;
}
