import { CommitteeQueueItem } from '../features/committee/data/committeeQueue.data';
import { FindingsCountResponse, FindingsListResponse } from '../types/findings';
import type { Oid } from '../types';
import { PdExecutionCounts, PdExecutionsResponse } from '../types/pdExecutions';
import type { MessageEvent } from '../types/messages';
import { requestJson } from './api/request';
import { fetchMessageEvents } from './telemetryClient';

export async function apiGet<T>(url: string): Promise<T> {
    return requestJson<T>(url);
}

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
        >('/api/findings');

        return Array.isArray(data) ? data : data.findings;
    }

    async getFindingsCount(): Promise<FindingsCountResponse> {
        return apiGet('/api/findings/count');
    }

    async getPdExecutions(): Promise<PdExecutionsResponse> {
        return apiGet('/api/pd-executions');
    }

    async getPdExecutionsCount(): Promise<PdExecutionCounts> {
        return apiGet('/api/pd-executions/count');
    }

    async getCommitteeQueue(): Promise<CommitteeQueueItem[]> {
        return apiGet('/api/committee-queue');
    }

    async getTelemetryEvents(): Promise<MessageEvent[]> {
        const response = await fetchMessageEvents();
        return response.items;
    }

    async getOids(): Promise<Oid[]> {
        return apiGet<Oid[]>('/api/oids');
    }

    /* ==============================
       ✅ REAL INTEGRATION HEALTH API
    ============================== */
    async getIntegrationHealth(): Promise<IntegrationHealthResponse> {
        return apiGet<IntegrationHealthResponse>(
            '/api/health/integrations'
        );
    }
}

export const apiClient = new ApiClient();
