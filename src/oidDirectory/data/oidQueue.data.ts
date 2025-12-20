import { OidStatus } from "./oidStatus.data";

export interface OidQueueItem {
    oid: string;
    displayName: string;
    ownerOrg?: string;
    status: OidStatus;
    confidence: "HIGH" | "MEDIUM" | "LOW";
    lastSeen: string;
    hasFindings: boolean;
}

export const oidQueueData: OidQueueItem[] = [
    {
        oid: "2.16.840.1.113883.3.7777.2",
        displayName: "Unidentified Community Root",
        ownerOrg: undefined,
        status: "UNKNOWN",
        confidence: "LOW",
        lastSeen: "2025-01-15",
        hasFindings: true
    },
    {
        oid: "2.16.840.1.113883.3.5555.9",
        displayName: "Legacy Regional Exchange Root",
        ownerOrg: "Legacy Regional Exchange",
        status: "DEPRECATED",
        confidence: "MEDIUM",
        lastSeen: "2025-01-10",
        hasFindings: true
    },
    {
        oid: "2.16.840.1.113883.3.9999.1",
        displayName: "Acme Health Exchange Root",
        ownerOrg: "Acme Health Exchange",
        status: "ACTIVE",
        confidence: "HIGH",
        lastSeen: "2025-01-15",
        hasFindings: false
    },
    {
        oid: "2.16.840.1.113883.3.8888.4",
        displayName: "North Valley Hospital Assigning Authority",
        ownerOrg: "North Valley Hospital",
        status: "ACTIVE",
        confidence: "HIGH",
        lastSeen: "2025-01-14",
        hasFindings: false
    },
    {
        oid: "2.16.840.1.113883.3.6666.7",
        displayName: "Proposed Multi-Facility System Root",
        ownerOrg: "Unified Care Network",
        status: "PENDING",
        confidence: "MEDIUM",
        lastSeen: "2025-01-15",
        hasFindings: false
    }
];
