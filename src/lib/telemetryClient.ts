import { TELEMETRY_BASE_URL } from '../config/api';
import { telemetryEventsData } from '../features/telemetry/data/telemetryEvents.data';
import { TelemetryEvent } from '../telemetry/TelemetryEvent';

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

const normalizeTelemetryEvent = (event: RawTelemetryEvent): TelemetryEvent => {
    return {
        eventId: event.eventId,
        eventType: event.eventType,
        timestamp: event.timestamp,
        status: event.outcome?.status ?? 'UNKNOWN',
        durationMs: event.execution?.durationMs ?? 0,
        channelId: event.source?.channelId ?? '',
        environment: event.source?.environment ?? '',
        requestId: event.correlation?.requestId ?? '',
        interactionId: event.protocol?.interactionId ?? '',
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
