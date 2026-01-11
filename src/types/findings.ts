export interface Finding {
    id: string;
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
    createdAt?: string;
    updatedAt?: string | null;
}
