export interface Finding {
    id: string;
    organization?: string;
    environment?: string;
    type?: string;
    transaction?: string;
    title?: string;
    description?: string;
    executionId?: string;
    executionType?: string;
    severity?: string;
    category?: string;
    summary?: string;
    technicalDetail?: string;
    recommendedAction?: string;
    status?: string;
    firstSeenAt?: string | null;
    lastSeenAt?: string | null;
    detectedAt?: string;
    createdAt?: string;
    updatedAt?: string | null;
}
