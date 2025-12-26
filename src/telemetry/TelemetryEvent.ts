export interface TelemetryEvent {
    eventId: string;
    eventType: 'PD_EXECUTION' | string;
    timestamp: string;

    source: {
        system?: string;
        channelId?: string;
        environment?: 'TEST' | 'PROD' | string;
    } | null;
    correlation: {
        requestId?: string;
        messageId?: string;
    } | null;
    execution: {
        durationMs?: number;
    } | null;
    outcome: {
        status?: string;
        resultCount?: number;
    } | null;
    protocol: {
        standard?: string;
        interactionId?: string;
    } | null;
}
