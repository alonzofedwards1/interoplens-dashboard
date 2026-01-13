export interface TelemetryEvent {
    eventId: string;
    eventType: string;
    timestamp: string;
    source?: {
        channelId?: string;
        environment?: string;
    };
    outcome?: {
        status?: string;
        durationMs?: number;
    };
    correlation?: {
        requestId?: string;
    };
    raw?: unknown;
    status?: string;
    durationMs?: number;
    channelId?: string;
    environment?: string;
    requestId?: string;
    interactionId?: string;
}
