// src/types/oids.ts

export type OidStatus = "provisional" | "approved" | "deprecated";

export type OidConfidence = "HIGH" | "MEDIUM" | "LOW";

/** ✅ GOVERNANCE ACTIONS (single source of truth) */
export type OidGovernanceAction =
    | "APPROVE"
    | "REJECT"
    | "DEPRECATE"
    | "REACTIVATE";

export interface Oid {
    oid: string;
    displayName: string;
    ownerOrg?: string;
    status: OidStatus;
    confidence: OidConfidence;
    firstSeen: string;
    lastSeen: string;
}

export interface OidUsage {
    pd?: number;
    qd?: number;
    rd?: number;
    xds?: number;
}

export interface OidFindingSummary {
    id: string;
    severity: "OK" | "WARNING" | "CRITICAL";
    summary: string;
    lastObserved: string;
    executionId?: string;
}

export interface OidDetail extends Oid {
    usage?: OidUsage;
    findings?: OidFindingSummary[];
}
