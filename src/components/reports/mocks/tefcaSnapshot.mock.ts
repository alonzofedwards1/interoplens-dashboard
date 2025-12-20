export const tefcaSnapshotMock = {
    reportId: "tefca-snapshot",
    title: "TEFCA Interoperability Snapshot",
    version: "1.0",
    generatedAt: "2025-12-19T14:32:00Z",

    filtersApplied: {
        dateRange: "Last 30 Days",
        environment: "Production",
        status: "All"
    },

    overview: {
        overallHealth: "Degraded",
        successRate: 89,
        failureRate: 11,
        averageResponseTime: 2.4,
        trend: "Stable"
    },

    outcomeDistribution: [
        { outcome: "Successful", percentage: 89 },
        { outcome: "Partial Success", percentage: 6 },
        { outcome: "Failure", percentage: 5 }
    ],

    topRisks: [
        {
            riskLevel: "Medium",
            description:
                "Intermittent failures observed in DocumentQuery transactions during high-volume periods."
        },
        {
            riskLevel: "Medium",
            description:
                "Inconsistent metadata formatting across some participating systems."
        },
        {
            riskLevel: "Low",
            description:
                "Occasional delayed responses from downstream exchange partners."
        },
        {
            riskLevel: "Low",
            description:
                "Retry attempts may mask underlying configuration issues."
        },
        {
            riskLevel: "Low",
            description:
                "Limited visibility into partner-specific error attribution."
        }
    ],

    keyIndicators: [
        { name: "Patient Discovery", status: "healthy" },
        { name: "Document Query", status: "degraded" },
        { name: "Document Retrieve", status: "healthy" },
        { name: "Response Timeliness", status: "healthy" },
        { name: "Error Transparency", status: "degraded" }
    ],

    executiveNotes:
        "Interoperability performance remains generally stable with moderate risk indicators. No critical exchange outages were observed during the reporting period, though targeted improvements are recommended.",

    disclaimer:
        "This snapshot provides a high-level operational overview and is intended for informational purposes only."
} as const;
