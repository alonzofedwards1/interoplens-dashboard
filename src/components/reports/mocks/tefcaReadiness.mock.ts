export const tefcaReadinessMock = {
    reportId: "tefca-readiness",
    title: "TEFCA Readiness Assessment",
    version: "1.0",
    generatedAt: "2025-12-19T14:32:00Z",

    filtersApplied: {
        dateRange: "Last 30 Days",
        environment: "Production",
        status: "All"
    },

    executiveSummary: {
        readinessScore: 82,
        riskLevel: "Moderate",
        overallStatus: "Degraded",
        trend: "Improving"
    },

    coreMetrics: [
        {
            metricId: "patient-discovery",
            name: "Patient Discovery Success Rate",
            value: 94,
            unit: "%",
            status: "healthy",
            description: "Successful Patient Discovery responses across all queried endpoints."
        },
        {
            metricId: "document-query",
            name: "Document Query Reliability",
            value: 88,
            unit: "%",
            status: "degraded",
            description: "Consistency and completeness of XDS.b DocumentQuery responses."
        },
        {
            metricId: "document-retrieve",
            name: "Document Retrieve Completion",
            value: 91,
            unit: "%",
            status: "healthy",
            description: "Successful document retrieval following valid queries."
        },
        {
            metricId: "response-time",
            name: "Average Response Time",
            value: 2.1,
            unit: "seconds",
            status: "healthy",
            description: "Mean response latency across exchange transactions."
        },
        {
            metricId: "error-rate",
            name: "Overall Error Rate",
            value: 7,
            unit: "%",
            status: "degraded",
            description: "Percentage of transactions resulting in technical or semantic errors."
        },
        {
            metricId: "retry-rate",
            name: "Retry Rate",
            value: 4,
            unit: "%",
            status: "healthy",
            description: "Frequency of retried transactions due to transient failures."
        }
    ],

    findings: [
        {
            severity: "warning",
            category: "Metadata",
            description:
                "Inconsistent metadata population observed in DocumentQuery responses, particularly missing classCode values."
        },
        {
            severity: "warning",
            category: "Error Handling",
            description:
                "Some endpoints return generic error responses instead of structured SOAP faults."
        },
        {
            severity: "info",
            category: "Performance",
            description:
                "Patient Discovery success rates exceed baseline TEFCA expectations."
        },
        {
            severity: "info",
            category: "Stability",
            description:
                "Retry behavior indicates resilient handling of transient network failures."
        },
        {
            severity: "info",
            category: "Trend",
            description:
                "Overall readiness score has improved compared to the previous reporting period."
        }
    ],

    recommendations: [
        "Standardize metadata mapping for XDS DocumentQuery responses.",
        "Implement automated validation checks for required TEFCA metadata fields.",
        "Improve structured error handling for failed transactions.",
        "Continue monitoring response latency during peak exchange hours.",
        "Review retry thresholds to ensure optimal balance between resiliency and load."
    ],

    disclaimer:
        "This assessment is based on observed interoperability behavior and does not constitute formal TEFCA certification or compliance attestation."
} as const;
