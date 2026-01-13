export interface PdExecution {
    requestId: string;
    startedAt?: string;
    completedAt?: string;
    outcome?: string;
    durationMs?: number;
    executionTimeMs?: number;
    channelId?: string;
    environment?: string;
}

export type PdExecutionsResponse = PdExecution[];

export interface PdExecutionCountResponse {
    count: number;
}
