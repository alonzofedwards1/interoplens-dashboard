export type OidStatus =
    | "UNKNOWN"
    | "ACTIVE"
    | "DEPRECATED"
    | "PENDING";

export const OID_STATUS_LABELS: Record<OidStatus, string> = {
    UNKNOWN: "Unknown",
    ACTIVE: "Active",
    DEPRECATED: "Deprecated",
    PENDING: "Pending Approval"
};

export const OID_STATUS_ACTIONS: Record<OidStatus, string[]> = {
    UNKNOWN: [
        "ASSIGN_ORG",
        "MAP_ALIAS",
        "IGNORE",
        "CREATE_FINDING"
    ],
    ACTIVE: [
        "ADD_ALIAS",
        "DEPRECATE",
        "CREATE_FINDING"
    ],
    DEPRECATED: [
        "REACTIVATE",
        "MARK_MIGRATION_COMPLETE",
        "CREATE_FINDING"
    ],
    PENDING: [
        "APPROVE",
        "REJECT"
    ]
};
