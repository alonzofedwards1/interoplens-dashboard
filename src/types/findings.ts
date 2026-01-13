export interface Finding {
    id: string;
    title: string;
    status:
        | 'open'
        | 'resolved'
        | 'ignored'
        | 'compliant'
        | 'non-compliant'
        | 'committee_queue'
        | 'closed';
    severity?: 'low' | 'medium' | 'high' | 'warning' | 'critical';
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
    ownerOrg?: string;
    type?: string;
    transaction?: string;
}

export interface FindingsListResponse {
    findings: Finding[];
}

export interface FindingsCountResponse {
    count: number;
}
