import { CommitteeQueueItem } from '../features/committee/data/committeeQueue.data';
import { FindingsCountResponse, FindingsListResponse } from '../types/findings';
import type { Oid } from '../types';
import { PdExecutionCounts, PdExecutionsResponse } from '../types/pdExecutions';
import { TelemetryEvent } from '../types/telemetry';
import { API_BASE_URL } from '../config/api';
import { authFetch } from './api/auth';
import { safeJson } from './api/utils';
import { fetchTelemetryEvents } from './telemetryClient';

const buildUrl = (base: string, path: string) => `${base}${path}`;

export async function apiGet<T>(url: string): Promise<T> {
    const res = await authFetch(url);

    if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
    }

    return safeJson(res) as T;
}

export class ApiClient {
    async getFindings(): Promise<FindingsListResponse['findings']> {
        const data = await apiGet<
            FindingsListResponse | FindingsListResponse['findings']
        >(buildUrl(API_BASE_URL, '/api/findings'));

        return Array.isArray(data) ? data : data.findings;
    }

    async getFindingsCount(): Promise<FindingsCountResponse> {
        return apiGet(buildUrl(API_BASE_URL, '/api/findings/count'));
    }

    async getPdExecutions(): Promise<PdExecutionsResponse> {
        return apiGet(buildUrl(API_BASE_URL, '/api/pd-executions'));
    }

    async getPdExecutionsCount(): Promise<PdExecutionCounts> {
        return apiGet(buildUrl(API_BASE_URL, '/api/pd-executions/count'));
    }

    async getCommitteeQueue(): Promise<CommitteeQueueItem[]> {
        return apiGet(buildUrl(API_BASE_URL, '/api/committee-queue'));
    }

    async getTelemetryEvents(): Promise<TelemetryEvent[]> {
        return fetchTelemetryEvents();
    }

    // ✅ FIXED
    async getOids(): Promise<Oid[]> {
        return apiGet<Oid[]>(buildUrl(API_BASE_URL, '/api/oids'));
    }
}

export const apiClient = new ApiClient();
