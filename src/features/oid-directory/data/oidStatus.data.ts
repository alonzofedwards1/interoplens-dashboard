import type { OidStatus, OidGovernanceAction } from "../../../types";

export const OID_STATUS_LABELS: Record<OidStatus, string> = {
    UNKNOWN: "Unknown",
    PENDING: "Pending",
    ACTIVE: "Active",
    DEPRECATED: "Deprecated",
};

// Actions align to canonical lifecycle transitions:
// UNKNOWN -> PENDING -> ACTIVE -> DEPRECATED -> ACTIVE
export interface OidStatusActionConfig {
    action: OidGovernanceAction;
    label: string;
    targetStatus: OidStatus;
}

export const OID_STATUS_ACTIONS: Record<
    OidStatus,
    readonly OidStatusActionConfig[]
> = {
    UNKNOWN: [
        {
            action: "APPROVE",
            label: "Move to Pending",
            targetStatus: "PENDING",
        },
    ],
    PENDING: [
        {
            action: "APPROVE",
            label: "Activate",
            targetStatus: "ACTIVE",
        },
    ],
    ACTIVE: [
        {
            action: "DEPRECATE",
            label: "Deprecate",
            targetStatus: "DEPRECATED",
        },
    ],
    DEPRECATED: [
        {
            action: "REACTIVATE",
            label: "Reactivate",
            targetStatus: "ACTIVE",
        },
    ],
} as const;
