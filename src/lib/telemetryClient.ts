import { TELEMETRY_BASE_URL } from '../config/api';
import { telemetryEventsData } from '../features/telemetry/data/telemetryEvents.data';
import { TelemetryEvent } from '../telemetry/TelemetryEvent';

type RawTelemetryEvent = {
    event_type?: string | null;
    timestamp_utc?: string | null;
    received_at?: string | null;
    status?: string | null;
    duration_ms?: number | null;
    environment?: string | null;
    source_channel_id?: string | null;
    correlation_request_id?: string | null;
    correlation_message_id?: string | null;
    protocol_interaction_id?: string | null;
    event_id?: string | null;
};

const toOptionalString = (value: unknown): string | undefined => {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }

    return undefined;
};

const toOptionalNumber = (value: unknown): number | undefined => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    return undefined;
};

const normalizeTelemetryEvent = (event: RawTelemetryEvent): TelemetryEvent => {
    const timestamp =
        toOptionalString(event.timestamp_utc) ??
        toOptionalString(event.received_at) ??
        new Date(0).toISOString();

    const status = toOptionalString(event.status) ?? 'UNKNOWN';

    return {
        eventId: toOptionalString(event.event_id),
        eventType: toOptionalString(event.event_type),
        timestamp,
        source: {
            environment: toOptionalString(event.environment),
            channelId: toOptionalString(event.source_channel_id),
        },
        outcome: {
            status,
        },
        execution: {
            durationMs: toOptionalNumber(event.duration_ms),
        },
        correlation: {
            requestId: toOptionalString(event.correlation_request_id),
            messageId: toOptionalString(event.correlation_message_id),
        },
        protocol: {
            interactionId: toOptionalString(event.protocol_interaction_id),
        },
    };
};

export const normalizeTelemetryEvents = (data: unknown): TelemetryEvent[] => {
    if (Array.isArray(data)) {
        return data.map(item => normalizeTelemetryEvent(item as RawTelemetryEvent));
    }

    if (Array.isArray((data as { events?: unknown[] })?.events)) {
        return (data as { events: unknown[] }).events.map(item =>
            normalizeTelemetryEvent(item as RawTelemetryEvent)
        );
    }

    throw new Error('Unexpected telemetry events response format');
};

export type TelemetryQueryParams = {
    page?: number;
    pageSize?: number;
    status?: string;
    environment?: string;
    search?: string;
};

export async function fetchTelemetryEvents(
    _params?: TelemetryQueryParams
): Promise<TelemetryEvent[]> {
    try {
        const res = await fetch(`${TELEMETRY_BASE_URL}/api/telemetry/events`);
        if (!res.ok) {
            const message = await safeErrorMessage(res);
            throw new Error(message ?? 'Failed to fetch telemetry events');
        }
        const data = await res.json();
        return normalizeTelemetryEvents(data);
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            return telemetryEventsData;
        }
        throw error;
    }
}

const safeErrorMessage = async (response: Response) => {
    try {
        const body = await response.json();
        if (typeof body?.message === 'string') return body.message;
    } catch (error) {
        // ignore JSON parse failures
    }
    return undefined;
};
