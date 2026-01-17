import { CommitteeQueueItem } from '../features/committee/data/committeeQueue.data';
import {
    FindingsCountResponse,
    FindingsListResponse,
    OidsListResponse,
    TelemetryEvent,
    PdExecutionsResponse,
    PdExecutionCountResponse,
} from '../types';
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
    const res = await fetch(url, { credentials: 'include' });
    console.debug('API response', res);

    if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
    }

    return safeJson(res) as T;
}

export class ApiClient {
    async getFindings(): Promise<FindingsListResponse['findings']> {
        const data = await apiGet<FindingsListResponse | FindingsListResponse['findings']>(
            buildUrl(API_BASE_URL, '/api/findings')
        );
        return Array.isArray(data) ? data : data.findings;
    }

    async getFindingsCount(): Promise<FindingsCountResponse> {
        return apiGet<FindingsCountResponse>(
            buildUrl(API_BASE_URL, '/api/findings/count')
        );
    }

    async getPdExecutions(): Promise<PdExecutionsResponse> {
        const data = await apiGet<PdExecutionsResponse>(
            buildUrl(API_BASE_URL, '/api/pd-executions')
        );
        console.log('[apiClient.getPdExecutions] response', {
            isArray: Array.isArray(data),
            length: Array.isArray(data) ? data.length : 'n/a',
            sample: Array.isArray(data) ? data[0] : data,
        });
        return data;
    }

    async getPdExecutionsCount(): Promise<PdExecutionCountResponse> {
        return apiGet<PdExecutionCountResponse>(
            buildUrl(API_BASE_URL, '/api/pd-executions/count')
        );
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

    async getOids(): Promise<OidsListResponse> {
        return apiGet<OidsListResponse>(buildUrl(API_BASE_URL, '/api/oids'));
    }
}

export const apiClient = new ApiClient();
