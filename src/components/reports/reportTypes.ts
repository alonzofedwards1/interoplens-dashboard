export type ReportId =
    | "tefca-readiness"
    | "tefca-snapshot"
    | "pd-anomaly-deep-dive"
    | "cert-renewal-forecast";

export interface BaseReport {
    reportId: ReportId;
    title: string;
    version: string;
    generatedAt: string;
    filtersApplied: {
        dateRange: string;
        environment: string;
        status: string;
    };
    disclaimer: string;
}

/* ---------- TEFCA READINESS ---------- */

export interface TefcaReadinessReport extends BaseReport {
    reportId: "tefca-readiness";
    executiveSummary: {
        readinessScore: number;
        riskLevel: string;
        overallStatus: string;
        trend: string;
    };
    coreMetrics: {
        metricId: string;
        name: string;
        value: number;
        unit: string;
        status: string;
        description: string;
    }[];
    findings: {
        severity: string;
        category: string;
        description: string;
    }[];
    recommendations: string[];
}

/* ---------- TEFCA SNAPSHOT ---------- */

export interface TefcaSnapshotReport extends BaseReport {
    reportId: "tefca-snapshot";
    overview: {
        overallHealth: string;
        successRate: number;
        failureRate: number;
        averageResponseTime: number;
        trend: string;
    };
    outcomeDistribution: {
        outcome: string;
        percentage: number;
    }[];
    topRisks: {
        riskLevel: string;
        description: string;
    }[];
    keyIndicators: {
        name: string;
        status: string;
    }[];
}

export type Report =
    | TefcaReadinessReport
    | TefcaSnapshotReport;
