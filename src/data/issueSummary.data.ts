export interface FailureCategory {
    label: string;
    percentage: number;
}

export interface IssueSummaryData {
    overallHealth: {
        status: string;
        successRate: number;
    };
    certificateHealth: {
        expired: number;
        expiringSoon: number;
        valid: number;
    };
    primaryFailureDriver: {
        label: string;
        affectedPartners: number;
    };
    analystBreakdown: {
        failureCategories: FailureCategory[];
        notableTrends: string[];
        observations: string[];
        riskSignals: string[];
        rootCauseHypotheses: string[];
        recommendations: string[];
    };
}

export const issueSummaryData: IssueSummaryData = {
    overallHealth: {
        status: "Stable",
        successRate: 92,
    },
    certificateHealth: {
        expired: 2,
        expiringSoon: 5,
        valid: 142,
    },
    primaryFailureDriver: {
        label: "Partner Certificate Expiry",
        affectedPartners: 2,
    },
    analystBreakdown: {
        failureCategories: [
            { label: "Certificate / Trust Issues", percentage: 41 },
            { label: "Metadata Mismatch", percentage: 27 },
            { label: "Payload Validation Errors", percentage: 18 },
            { label: "Timeout / Connectivity", percentage: 14 },
            { label: "Policy Enforcement Failures", percentage: 9 },
            { label: "Rate Limiting / Throttling", percentage: 7 },
            { label: "Unsupported Code Systems", percentage: 6 },
            { label: "Downstream Registry Availability", percentage: 5 },
        ],
        notableTrends: [
            "Error rates increased following the last metadata refresh window, suggesting configuration drift across partners.",
            "No statistically significant correlation observed between inbound traffic volume and failure rates.",
            "Retry success rates remain high, indicating transient rather than systemic failures.",
            "Certificate-related failures spike immediately after trust store updates.",
        ],
        observations: [
            "Several partners interpret required metadata fields differently, particularly classCode and practiceSettingCode.",
            "Partial successes in Document Query responses are masking downstream retrieval failures.",
            "Error responses are inconsistently structured, complicating automated triage.",
            "Some endpoints return HTTP 200 responses with embedded SOAP faults.",
        ],
        riskSignals: [
            "Increasing reliance on retries may conceal underlying latency and degradation.",
            "Inconsistent certificate rotation schedules introduce recurring trust failures.",
            "Higher document volumes correlate with greater metadata variance.",
            "Policy enforcement failures suggest security posture misalignment.",
        ],
        rootCauseHypotheses: [
            "Metadata schema updates are not propagated consistently.",
            "Certificate trust anchors updated without downstream validation.",
            "Some systems operate against outdated implementation guides.",
            "Validation logic differs between registry and responder components.",
        ],
        recommendations: [
            "Establish a standardized metadata conformance checklist.",
            "Introduce pre-deployment certificate trust validation.",
            "Normalize error response structures.",
            "Monitor partial successes as early failure indicators.",
            "Review retry thresholds to avoid masking performance issues.",
        ],
    },
};
