import { CommitteeStatus } from './committeeStatus';
import { committeeCasesData } from './committeeCases.data';

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

export const committeeQueueData: CommitteeQueueItem[] = committeeCasesData.map(
    (committeeCase) => ({
        id: committeeCase.id,
        organization: committeeCase.organization,
        issueType: committeeCase.issueType,
        severity: committeeCase.severity,
        evidenceTrigger: committeeCase.escalationTrigger,
        submitted: committeeCase.firstDetected,
        decisionTarget: committeeCase.decisionTarget,
        status: committeeCase.status,
    })
);
