export interface TelemetryEvent {
    eventId: string;
    eventType: 'PD_EXECUTION' | string;
    timestamp: string;

    source: {
        system?: string;
        channelId?: string;
        environment?: 'TEST' | 'PROD' | string;
        organization?: string;
        qhin?: string;
        endpointType?: string;
    } | null;
    correlation: {
        requestId?: string;
        messageId?: string;
    } | null;
    execution: {
        durationMs?: number;
        startTime?: string;
        endTime?: string;
    } | null;
    outcome: {
        status?: string;
        resultCount?: number;
        errorCode?: string | null;
        errorMessage?: string | null;
    } | null;
    protocol: {
        standard?: string;
        interactionId?: string;
    } | null;
}
