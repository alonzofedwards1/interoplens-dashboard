import { Finding } from '../features/findings/data/findings.data';
import { PDExecution } from '../features/pd-executions/data/pdExecutions.data';
import { CommitteeQueueItem } from '../features/committee/data/committeeQueue.data';
import { TelemetryEvent } from '../telemetry/TelemetryEvent';
import { API_BASE_URL } from '../config/api';
import { fetchTelemetryEvents } from './telemetryClient';

const buildUrl = (base: string, path: string) => `${base}${path}`;

export async function safeJson(response: Response) {
    const text = await response.text();

    try {
        return text ? JSON.parse(text) : null;
    } catch {
        throw new Error('Invalid JSON response');
    }
}

export async function apiGet<T>(url: string): Promise<T> {
    const res = await fetch(url);
    console.debug('API response', res);

    if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
    }

    return safeJson(res) as T;
}

export class ApiClient {
    async getFindings(): Promise<Finding[]> {
        return apiGet<Finding[]>(buildUrl(API_BASE_URL, '/api/findings'));
    }

    async getPdExecutions(): Promise<PDExecution[]> {
        const data = await apiGet<PDExecution[]>(
            buildUrl(API_BASE_URL, '/api/pd-executions')
        );
        console.log('[apiClient.getPdExecutions] response', {
            isArray: Array.isArray(data),
            length: Array.isArray(data) ? data.length : 'n/a',
            sample: Array.isArray(data) ? data[0] : data,
        });
        return data;
    }

    async getCommitteeQueue(): Promise<CommitteeQueueItem[]> {
        return apiGet<CommitteeQueueItem[]>(
            buildUrl(API_BASE_URL, '/api/committee-queue')
        );
    }

    async getTelemetryEvents(): Promise<TelemetryEvent[]> {
        // Normalization already handled in telemetryClient.ts
        return fetchTelemetryEvents();
    }
}

export const apiClient = new ApiClient();
