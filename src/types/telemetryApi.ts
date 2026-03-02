export interface TelemetryApiRow {
    eventId: string;
    eventType: string;
    timestamp: string;
    status?: string;
    durationMs?: number;
    channelId?: string;
    environment?: string;
    requestId?: string;
    interactionId?: string;
    raw?: unknown;
}
