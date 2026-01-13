import { apiGet } from '../apiClient';

export type OidStatus =
    | 'provisional'
    | 'approved'
    | 'deprecated';

export type OidConfidence =
    | 'HIGH'
    | 'MEDIUM'
    | 'LOW';

export interface OidRecord {
    oid: string;
    displayName: string;
    ownerOrg: string;
    status: OidStatus;
    confidence: OidConfidence;
    firstSeen: string;
    lastSeen: string;
}

export interface OidDetail extends OidRecord {
    usage: {
        pd: number;
        qd: number;
        rd: number;
        xds: number;
    };
}

export async function fetchOids(): Promise<OidRecord[]> {
    return apiGet<OidRecord[]>('/api/oids');
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
