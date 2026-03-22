import { CommitteeQueueItem } from '../features/committee/data/committeeQueue.data';
import { FindingsCountResponse, FindingsListResponse } from '../types/findings';
import type { Oid } from '../types';
import {
    PdExecutionCounts,
    PdExecutionsResponse,
    RawPdExecution,
} from '../types/pdExecutions';
import type { MessageMonitorRow } from '../types/messages';
import { requestJson } from './api/request';
import { API_BASE } from './apiBase';
import { fetchMessageEvents } from './telemetryClient';
import { normalizePdExecutions } from './normalizers/pdExecutions';

export async function apiGet<T>(url: string): Promise<T> {
    return requestJson<T>(url);
}

type QueryParams = Record<string, string | number | boolean | undefined>;

const buildQueryString = (params?: QueryParams) => {
    if (!params) return '';
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined) return;
        searchParams.set(key, String(value));
    });
    const query = searchParams.toString();
    return query ? `?${query}` : '';
};

/* ============================================================
   Integration Health Types
============================================================ */

export interface IntegrationHealthResponse {
    totalExecutions: number;
    successRate: number;
    certificateHealth: {
        expired: number;
        expiringSoon: number;
        valid: number | null;
    };
    affectedPartners: number;
}

/* ============================================================
   API CLIENT
============================================================ */

export class ApiClient {
    async getFindings(): Promise<FindingsListResponse['findings']> {
        const data = await apiGet<
            FindingsListResponse | FindingsListResponse['findings']
        >(`${API_BASE}/api/findings`);

        return Array.isArray(data) ? data : data.findings;
    }

    async getFindingsCount(): Promise<FindingsCountResponse> {
        return apiGet(`${API_BASE}/api/findings/count`);
    }

    async getPdExecutions(params?: QueryParams): Promise<PdExecutionsResponse> {
        const data = await apiGet<RawPdExecution[]>(
            `${API_BASE}/api/pd-executions${buildQueryString(params)}`
        );
        return normalizePdExecutions(Array.isArray(data) ? data : []);
    }

    async getPdExecutionsCount(params?: QueryParams): Promise<PdExecutionCounts> {
        return apiGet(`${API_BASE}/api/pd-executions/count${buildQueryString(params)}`);
    }

    async getCommitteeQueue(): Promise<CommitteeQueueItem[]> {
        return apiGet(`${API_BASE}/api/committee-queue`);
    }

    async getTelemetryEvents(): Promise<MessageMonitorRow[]> {
        const response = await fetchMessageEvents();
        return response.items;
    }

    async getOids(): Promise<Oid[]> {
        return apiGet<Oid[]>(`${API_BASE}/api/oids`);
    }

    /* ==============================
       ✅ REAL INTEGRATION HEALTH API
    ============================== */
    async getIntegrationHealth(): Promise<IntegrationHealthResponse> {
        return apiGet<IntegrationHealthResponse>(
            `${API_BASE}/api/health/integrations`
        );
    }
}

export const apiClient = new ApiClient();
