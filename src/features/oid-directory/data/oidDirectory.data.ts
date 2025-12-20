import { OidStatus } from "./oidStatus.data";

export interface OidDirectoryRecord {
    oid: string;
    displayName: string;
    ownerOrg?: string;
    status: OidStatus;
    canonical: boolean;
    aliases: string[];
    confidence: "HIGH" | "MEDIUM" | "LOW";
    source: "OBSERVED" | "IMPORTED" | "MANUAL";
    firstSeen: string;
    lastSeen: string;
    usage: {
        pd: number;
        qd: number;
        rd: number;
        xds: number;
    };
    notes?: string;
}

export const oidDirectoryData: OidDirectoryRecord[] = [
    {
        oid: "2.16.840.1.113883.3.7777.2",
        displayName: "Unidentified Community Root",
        status: "UNKNOWN",
        canonical: false,
        aliases: [
            "urn:oid:2.16.840.1.113883.3.7777.2"
        ],
        confidence: "LOW",
        source: "OBSERVED",
        firstSeen: "2025-01-13",
        lastSeen: "2025-01-15",
        usage: {
            pd: 48,
            qd: 0,
            rd: 0,
            xds: 3
        },
        notes:
            "Observed in interoperability routing metadata. No owning organization identified."
    },
    {
        oid: "2.16.840.1.113883.3.5555.9",
        displayName: "Legacy Regional Exchange Root",
        ownerOrg: "Legacy Regional Exchange",
        status: "DEPRECATED",
        canonical: false,
        aliases: [
            "urn:oid:2.16.840.1.113883.3.5555.9"
        ],
        confidence: "MEDIUM",
        source: "IMPORTED",
        firstSeen: "2023-06-18",
        lastSeen: "2025-01-10",
        usage: {
            pd: 12,
            qd: 6,
            rd: 1,
            xds: 0
        },
        notes:
            "Deprecated assigning authority still observed in limited query traffic."
    },
    {
        oid: "2.16.840.1.113883.3.9999.1",
        displayName: "Acme Health Exchange Root",
        ownerOrg: "Acme Health Exchange",
        status: "ACTIVE",
        canonical: true,
        aliases: [
            "urn:oid:2.16.840.1.113883.3.9999.1",
            "https://acme-hie.example.org/fhir"
        ],
        confidence: "HIGH",
        source: "OBSERVED",
        firstSeen: "2024-10-12",
        lastSeen: "2025-01-15",
        usage: {
            pd: 1243,
            qd: 892,
            rd: 401,
            xds: 57
        },
        notes:
            "Primary assigning authority for Acme Health Exchange."
    },
    {
        oid: "2.16.840.1.113883.3.8888.4",
        displayName: "North Valley Hospital Assigning Authority",
        ownerOrg: "North Valley Hospital",
        status: "ACTIVE",
        canonical: true,
        aliases: [
            "urn:oid:2.16.840.1.113883.3.8888.4"
        ],
        confidence: "HIGH",
        source: "OBSERVED",
        firstSeen: "2024-11-02",
        lastSeen: "2025-01-14",
        usage: {
            pd: 654,
            qd: 221,
            rd: 109,
            xds: 0
        },
        notes:
            "Hospital-level assigning authority used primarily for patient discovery."
    },
    {
        oid: "2.16.840.1.113883.3.6666.7",
        displayName: "Proposed Multi-Facility System Root",
        ownerOrg: "Unified Care Network",
        status: "PENDING",
        canonical: true,
        aliases: [],
        confidence: "MEDIUM",
        source: "MANUAL",
        firstSeen: "2025-01-15",
        lastSeen: "2025-01-15",
        usage: {
            pd: 0,
            qd: 0,
            rd: 0,
            xds: 0
        },
        notes:
            "Submitted for governance review prior to activation."
    }
];
