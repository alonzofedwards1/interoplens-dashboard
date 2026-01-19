import { TELEMETRY_BASE_URL } from '../config/api';
import { TelemetryEvent } from '../telemetry/TelemetryEvent';
import { safeJson } from './api/utils';

type RawTelemetryEvent = {
    eventId: string;
    eventType: string;
    timestamp: string;
    source?: {
        system?: string | null;
        channelId?: string;
        environment?: string;
    };
    correlation?: {
        requestId?: string;
        messageId?: string;
    };
    execution?: {
        durationMs?: number;
    };
    outcome?: {
        status?: string;
        resultCount?: number | null;
    };
    protocol?: {
        interactionId?: string;
        standard?: string | null;
    };
};

const normalizeTelemetryEvent = (event: RawTelemetryEvent): TelemetryEvent => ({
    eventId: event.eventId,
    eventType: event.eventType,
    timestamp: event.timestamp,
    status: event.outcome?.status ?? 'UNKNOWN',
    durationMs: event.execution?.durationMs ?? 0,
    channelId: event.source?.channelId ?? '',
    environment: event.source?.environment ?? '',
    requestId: event.correlation?.requestId ?? '',
    interactionId: event.protocol?.interactionId ?? '',
});

export type TelemetryFilterParams = {
    startTime?: string;
    endTime?: string;
    organization?: string;
    transactionType?: string;
};

export async function fetchTelemetryEvents(
    filters?: TelemetryFilterParams
): Promise<TelemetryEvent[]> {
    const params = new URLSearchParams();

    if (filters?.startTime) params.set('startTime', filters.startTime);
    if (filters?.endTime) params.set('endTime', filters.endTime);
    if (filters?.organization) params.set('organization', filters.organization);
    if (filters?.transactionType) params.set('transactionType', filters.transactionType);

    const query = params.toString();
    const url = `${TELEMETRY_BASE_URL}/api/telemetry/events${query ? `?${query}` : ''}`;
    const res = await fetch(url, {
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch telemetry events (${res.status})`);
    }

    const data = await safeJson(res);

    if (!Array.isArray(data)) {
        throw new Error('Unexpected telemetry response format');
    }

    return data.map(normalizeTelemetryEvent);
}
