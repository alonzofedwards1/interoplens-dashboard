import { TelemetryEvent } from '../telemetry/TelemetryEvent';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

export async function fetchTelemetryEvents(): Promise<TelemetryEvent[]> {
    const res = await fetch(`${API_BASE}/telemetry/events`);
    if (!res.ok) {
        throw new Error('Failed to fetch telemetry events');
    }
    return res.json();
}
