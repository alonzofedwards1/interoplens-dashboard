import { apiGet } from '../apiClient';
import { Oid, OidDetail, OidsListResponse } from '../../types';

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
    const res = await fetch(`/api/oids/${encodeURIComponent(oid)}/governance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
    });

    if (!res.ok) throw new Error('Governance action failed');
}
