import { Finding } from '../features/findings/data/findings.data';
import { PDExecution } from '../features/pd-executions/data/pdExecutions.data';
import { CommitteeQueueItem } from '../features/committee/data/committeeQueue.data';
import { TelemetryEvent } from '../telemetry/TelemetryEvent';
import { normalizeTelemetryEvents } from './telemetryClient';
import { API_BASE_URL, TELEMETRY_BASE_URL } from '../config/api';

const buildUrl = (base: string, path: string) => `${base}${path}`;

const request = async <T>(path: string, baseUrl: string = API_BASE_URL): Promise<T> => {
    const response = await fetch(buildUrl(baseUrl, path));

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
    getTelemetryEvents: async () => {
        const data = await request<unknown>(
            '/api/telemetry/events',
            TELEMETRY_BASE_URL
        );
        return normalizeTelemetryEvents(data);
    },
};

export type ApiClient = typeof apiClient;
