import { TELEMETRY_BASE_URL } from '../config/api';
import { TelemetryEvent } from '../telemetry/TelemetryEvent';

export async function fetchTelemetryEvents(): Promise<TelemetryEvent[]> {
    const res = await fetch(`${TELEMETRY_BASE_URL}/api/telemetry/events`);
    if (!res.ok) {
        const message = await safeErrorMessage(res);
        throw new Error(message ?? 'Failed to fetch telemetry events');
    }
    const data = await res.json();

    if (Array.isArray(data)) {
        return data as TelemetryEvent[];
    }

    if (Array.isArray((data as { events?: TelemetryEvent[] })?.events)) {
        return (data as { events: TelemetryEvent[] }).events;
    }

    throw new Error('Unexpected telemetry events response format');
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
