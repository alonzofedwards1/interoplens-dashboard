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
    const res = await fetch('/api/health/integrations', {
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error('Failed to load integration health');
    }

    return res.json();
}
