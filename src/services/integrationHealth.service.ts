import { authFetch } from '../lib/api/auth';
import { safeJson } from '../lib/api/utils';
import { IntegrationHealthResponse } from '../types/integrationHealth';

const assertOk = async (response: Response) => {
    if (!response.ok) {
        let message = `${response.status} ${response.statusText}`;
        try {
            const data = await safeJson(response.clone());
            if (data && typeof data === 'object' && 'message' in data) {
                message = String(
                    (data as { message?: string }).message ?? message
                );
            }
        } catch {
            // Ignore JSON parsing errors
        }
        throw new Error(message);
    }
};

export const fetchIntegrationHealth = async (): Promise<IntegrationHealthResponse> => {
    const response = await authFetch('/api/health/integrations', {
        method: 'GET',
    });
    await assertOk(response);
    return (await safeJson(response)) as IntegrationHealthResponse;
};
