export type OidStatus =
    | 'UNKNOWN'
    | 'ACTIVE'
    | 'PENDING'
    | 'DEPRECATED';

export type OidConfidence =
    | 'HIGH'
    | 'MEDIUM'
    | 'LOW';

export interface OidRecord {
    oid: string;
    displayName: string;
    ownerOrg?: string;
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
    const res = await fetch('/api/oids');
    if (!res.ok) throw new Error('Failed to load OIDs');
    return res.json();
}

export async function fetchOidDetail(oid: string): Promise<OidDetail> {
    const res = await fetch(`/api/oids/${encodeURIComponent(oid)}`);
    if (!res.ok) throw new Error('Failed to load OID detail');
    return res.json();
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
