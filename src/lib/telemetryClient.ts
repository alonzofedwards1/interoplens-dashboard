import { TelemetryEvent } from '../telemetry/TelemetryEvent';

const DEFAULT_API_BASE = 'http://100.27.251.103:8081/api';
const API_BASE = process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE;

export async function fetchTelemetryEvents(): Promise<TelemetryEvent[]> {
    const res = await fetch(`${API_BASE}/telemetry/events`);
    if (!res.ok) {
        throw new Error('Failed to fetch telemetry events');
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
