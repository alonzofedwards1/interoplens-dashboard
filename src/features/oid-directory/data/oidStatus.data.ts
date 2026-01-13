export type OidStatus =
    | "provisional"
    | "approved"
    | "deprecated";

export const OID_STATUS_LABELS: Record<OidStatus, string> = {
    provisional: "Provisional",
    approved: "Approved",
    deprecated: "Deprecated"
};

export const OID_STATUS_ACTIONS: Record<OidStatus, string[]> = {
    provisional: [
        "APPROVE",
        "REJECT"
    ],
    approved: [
        "DEPRECATE"
    ],
    deprecated: [
        "REACTIVATE"
    ]
};
