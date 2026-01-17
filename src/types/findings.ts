export type FindingSeverity =
    | 'low'
    | 'medium'
    | 'high'
    | 'warning'
    | 'critical'
    | 'ok'; // needed for UI filtering logic

export type FindingStatus =
    | 'open'
    | 'resolved'
    | 'ignored'
    | 'compliant'
    | 'non-compliant'
    | 'committee_queue'
    | 'closed';

export interface Finding {
    /** Identity */
    id: string;

    /** Human-facing */
    title?: string;
    summary?: string;
    description?: string; // used by ExampleFindings + table
    technicalDetail?: string;
    recommendedAction?: string;

    /** Classification */
    status: FindingStatus;
    severity?: FindingSeverity;
    category?: string;
    type?: string;

    /** Ownership / attribution */
    ownerOrg?: string;
    organization?: string; // REQUIRED by UI filters + tables
    source?: string;        // REQUIRED by ExampleFindings

    /** Execution / telemetry linkage */
    executionId?: string;
    executionType?: string;
    transaction?: string;

    /** Environment / runtime */
    environment?: string;

    /** Temporal */
    createdAt: string;
    detectedAt?: string;
    firstSeenAt?: string | null;
    lastSeenAt?: string | null;
}

export interface FindingsListResponse {
    findings: Finding[];
}

export interface FindingsCountResponse {
    count: number;
}
