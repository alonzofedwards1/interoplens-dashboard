export interface MessageEvent {
    id: string;
    source: 'transport' | 'telemetry';
    timestamp: string;
    status: 'Success' | 'Error' | 'Warning';
    eventType: string;
    requestId?: string;
    transactionId?: string;
    channelId?: string;
    interactionId?: string;
    durationMs?: number;
    environment?: string;
    certificate?: {
        thumbprint: string;
        status: 'Valid' | 'Expired' | 'Expiring Soon';
    };
}
