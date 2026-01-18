/* ============================================================
   Organization (resolved via OID → org join)
============================================================ */

export interface FindingOrganization {
    id: string;
    name: string;
    type?: string;
}

/* ============================================================
   Finding
============================================================ */

export interface Finding {
    id: string;

    // Legacy / UI fields (kept for compatibility)
    name?: string;
    title?: string;

    status:
        | 'open'
        | 'resolved'
        | 'ignored'
        | 'compliant'
        | 'non-compliant'
        | 'committee_queue'
        | 'closed';

    severity?:
        | 'low'
        | 'medium'
        | 'high'
        | 'warning'
        | 'critical';

    createdAt: string;

    executionId?: string;
    executionType?: string;

    category?: string;
    summary?: string;
    technicalDetail?: string;
    recommendedAction?: string;

    environment?: string;

    firstSeenAt?: string | null;
    lastSeenAt?: string | null;
    detectedAt?: string;

    ownerOrg?: string; // legacy (string-based)

    // ✅ NEW: resolved organization object
    organization?: FindingOrganization | null;

    relatedOid?: string;

    type?: string;
    transaction?: string;
}

/* ============================================================
   API Responses
============================================================ */

export interface FindingsListResponse {
    findings: Finding[];
}

export interface FindingsCountOut {
    count: number;
}

/**
 * Frontend-facing alias (prevents breaking imports)
 */
export type FindingsCountResponse = FindingsCountOut;
