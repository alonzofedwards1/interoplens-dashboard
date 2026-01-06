import { TELEMETRY_BASE_URL } from '../config/api';
import { isAuthEnabled } from '../config/auth';
import { getSessionToken } from './authClient';
import { TelemetryEvent } from '../telemetry/TelemetryEvent';

const withAuthHeaders = (): RequestInit | undefined => {
    if (!isAuthEnabled) return undefined;

    const token = getSessionToken();
    if (!token) return undefined;

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export async function fetchTelemetryEvents(): Promise<TelemetryEvent[]> {
    const res = await fetch(
        `${TELEMETRY_BASE_URL}/api/telemetry/events`,
        withAuthHeaders()
    );
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
