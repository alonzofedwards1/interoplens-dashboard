import type {
    Oid,
    OidConfidence,
    OidDetail,
    OidFindingSummary,
    OidStatus,
    OidUsage,
} from "../../../types";

const VALID_STATUSES: readonly OidStatus[] = [
    "UNKNOWN",
    "PENDING",
    "ACTIVE",
    "DEPRECATED",
];

const VALID_CONFIDENCE: readonly OidConfidence[] = [
    "HIGH",
    "MEDIUM",
    "LOW",
    "UNKNOWN",
];

const normalizeString = (value: unknown, fallback: string) =>
    typeof value === "string" && value.trim().length > 0 ? value : fallback;

// Backend payloads can be partial or carry legacy status strings; normalize to canonical states.
const normalizeStatus = (status: unknown): OidStatus => {
    const candidate = typeof status === "string" ? status.toUpperCase() : "";
    return (VALID_STATUSES as readonly string[]).includes(candidate)
        ? (candidate as OidStatus)
        : "UNKNOWN";
};

const normalizeConfidence = (confidence: unknown): OidConfidence => {
    const candidate = typeof confidence === "string" ? confidence.toUpperCase() : "";
    return (VALID_CONFIDENCE as readonly string[]).includes(candidate)
        ? (candidate as OidConfidence)
        : "UNKNOWN";
};

const normalizeUsage = (usage: unknown): OidUsage | undefined => {
    if (!usage || typeof usage !== "object") return undefined;
    const typed = usage as OidUsage;
    return {
        pd: typed.pd,
        qd: typed.qd,
        rd: typed.rd,
        xds: typed.xds,
    };
};

const normalizeFindings = (findings: unknown): OidFindingSummary[] | undefined => {
    if (!Array.isArray(findings)) return undefined;
    return findings.filter(Boolean) as OidFindingSummary[];
};

export const normalizeOid = (source: Partial<Oid>, fallbackOid: string): Oid => ({
    oid: normalizeString(source.oid, fallbackOid),
    displayName: normalizeString(source.displayName, "Unnamed OID"),
    ownerOrg: normalizeString(source.ownerOrg, "Unassigned"),
    status: normalizeStatus(source.status),
    confidence: normalizeConfidence(source.confidence),
    firstSeen: normalizeString(source.firstSeen, "—"),
    lastSeen: normalizeString(source.lastSeen, "—"),
});

export const normalizeOidDetail = (
    source: Partial<OidDetail>,
    fallbackOid: string
): OidDetail => ({
    ...normalizeOid(source, fallbackOid),
    usage: normalizeUsage(source.usage),
    findings: normalizeFindings(source.findings),
});
