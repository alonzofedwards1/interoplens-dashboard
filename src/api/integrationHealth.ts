import { requestJson } from '../lib/api/request';
import { API_BASE } from '../lib/apiBase';

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

export async function fetchIntegrationHealth(): Promise<IntegrationHealthResponse> {
    return requestJson<IntegrationHealthResponse>(`${API_BASE}/api/health/integrations`);
}
