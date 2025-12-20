export interface CommitteeDecision {
    decision: string;
    rationale?: string;

    decidedBy?: string;
    decidedAt: string;

    riskAccepted?: boolean;
    followUpRequired?: boolean;
}
