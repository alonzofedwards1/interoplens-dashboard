export interface Oid {
    oid: string;
    displayName: string;
    ownerOrg: string;
    status: string;
    confidence: string;
    firstSeen: string;
    lastSeen: string;
}

export type OidsListResponse = Oid[];

export interface OidDetail extends Oid {
    usage?: {
        pd: number;
        qd: number;
        rd: number;
        xds: number;
    };
}
