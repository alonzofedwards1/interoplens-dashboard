import { OidStatus } from "../data/oidStatus.data";

export interface OidUsageMetrics {
    pd: number;
    qd: number;
    rd: number;
    xds: number;
}

export type OidConfidence = "HIGH" | "MEDIUM" | "LOW";
export type OidSource = "OBSERVED" | "IMPORTED" | "MANUAL";

export interface OidRecord {
    oid: string;
    displayName: string;
    ownerOrg?: string;
    status: OidStatus;
    canonical: boolean;
    aliases: string[];
    confidence: OidConfidence;
    source: OidSource;
    firstSeen: string;
    lastSeen: string;
    usage: OidUsageMetrics;
    notes?: string;
}
