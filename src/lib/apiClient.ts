import { Finding } from '../features/findings/data/findings.data';
import { PDExecution } from '../features/pd-executions/data/pdExecutions.data';
import { CommitteeQueueItem } from '../features/committee/data/committeeQueue.data';
import { TelemetryEvent } from '../telemetry/TelemetryEvent';
import { API_BASE_URL, TELEMETRY_BASE_URL } from '../config/api';
import { isAuthEnabled } from '../config/auth';
import { getSessionToken } from './authClient';

const buildUrl = (base: string, path: string) => `${base}${path}`;

const withAuthHeaders = (init?: RequestInit): RequestInit => {
    if (!isAuthEnabled) return init ?? {};

    const token = getSessionToken();
    if (!token) return init ?? {};

    const headers = new Headers(init?.headers ?? {});
    headers.set('Authorization', `Bearer ${token}`);

    return { ...init, headers };
};

const request = async <T>(path: string, baseUrl: string = API_BASE_URL): Promise<T> => {
    const response = await fetch(buildUrl(baseUrl, path), withAuthHeaders());

    if (!response.ok) {
        const message = await safeErrorMessage(response);
        throw new Error(message ?? `API request failed for ${path}: ${response.status}`);
    }

    try {
        return (await response.json()) as T;
    } catch (error) {
        throw new Error(`Invalid response from API for ${path}`);
    }
};

const safeErrorMessage = async (response: Response) => {
    try {
        const body = await response.json();
        if (typeof body?.message === 'string') return body.message;
    } catch (error) {
        // ignore JSON parse failures
    }
    return undefined;
};

export const apiClient = {
    getFindings: () => request<Finding[]>('/api/findings'),
    getPdExecutions: () => request<PDExecution[]>('/api/pd-executions'),
    getCommitteeQueue: () => request<CommitteeQueueItem[]>('/api/committee/queue'),
    getTelemetryEvents: () => request<TelemetryEvent[]>('/api/telemetry/events', TELEMETRY_BASE_URL),
};

export type ApiClient = typeof apiClient;
