import type { OidStatus, OidGovernanceAction } from "../../../types";

export const OID_STATUS_LABELS: Record<OidStatus, string> = {
    provisional: "Provisional",
    approved: "Approved",
    deprecated: "Deprecated",
};

export const OID_STATUS_ACTIONS: Record<
    OidStatus,
    readonly OidGovernanceAction[]
> = {
    provisional: ["APPROVE", "REJECT"],
    approved: ["DEPRECATE"],
    deprecated: ["REACTIVATE"],
} as const;
