import { OidStatus } from "../data/oidStatus.data";

export type OidDecisionType =
    | "ASSIGN_ORG"
    | "MAP_ALIAS"
    | "ADD_ALIAS"
    | "DEPRECATE"
    | "REACTIVATE"
    | "APPROVE"
    | "REJECT"
    | "IGNORE"
    | "MARK_MIGRATION_COMPLETE";

export interface OidGovernanceDecision {
    decisionId: string;
    oid: string;
    decisionType: OidDecisionType;
    previousStatus: OidStatus;
    resultingStatus: OidStatus;
    decidedBy: string;
    decidedAt: string;
    rationale?: string;
}
