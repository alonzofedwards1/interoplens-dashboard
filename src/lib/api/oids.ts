import { apiGet } from '../apiClient';
import { authFetch } from './auth';
import { OidDetail, OidsListResponse } from '../../types/oids';

export async function fetchOids(): Promise<OidsListResponse> {
    return apiGet<OidsListResponse>('/api/oids');
}

export async function fetchOidDetail(oid: string): Promise<OidDetail> {
    return apiGet<OidDetail>(`/api/oids/${encodeURIComponent(oid)}`);
}

export async function submitOidGovernance(
    oid: string,
    action: string,
    notes?: string
) {
    const res = await authFetch(`/api/oids/${encodeURIComponent(oid)}/governance`, {
        method: 'POST',
        body: JSON.stringify({ action, notes }),
    });

    if (!res.ok) throw new Error('Governance action failed');
}
