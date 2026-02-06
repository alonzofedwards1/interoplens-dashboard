import { requestJson } from '../lib/api/request';

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
    return requestJson<IntegrationHealthResponse>('/api/health/integrations');
}
