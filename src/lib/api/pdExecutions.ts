import { API_BASE_URL } from '../../config/api';
import { authFetch } from './auth';
import { safeJson } from './utils';

const BASE = `${API_BASE_URL}/api/pd-executions`;

export async function fetchPdExecutionTelemetry(executionId: string): Promise<unknown[]> {
    const res = await authFetch(`${BASE}/${encodeURIComponent(executionId)}/telemetry`);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to fetch PD execution telemetry');
    }

    const data = await safeJson(res);
    return Array.isArray(data) ? data : [];
}
