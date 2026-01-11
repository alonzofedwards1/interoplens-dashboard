import React, { type ReactNode } from 'react';
import {
    FaUsers,
    FaExclamationTriangle,
    FaBell,
    FaExclamationCircle,
    FaGavel,
} from 'react-icons/fa';

import { Finding } from '../../../types/findings';
import { PDExecution } from '../../pd-executions/data/pdExecutions.data';
import { TelemetryEvent } from '../../../telemetry/TelemetryEvent';

/* ============================
   Types
============================ */

export interface AlertCard {
    title: string;
    value: string;
    icon: ReactNode;
    bgColor: string;
    textColor: string;
    route: string;
}

export interface InsightCard {
    title: string;
    summary: string;
    detail: string;
}

export type ComplianceStandard = 'TEFCA' | 'IHE' | 'HL7';

/* ============================
   Metric Derivers
============================ */

const deriveFindingsMetrics = (findings: Finding[]) => {
    const committeeQueueCount = findings.filter(
        f => (f.status ?? '').toLowerCase() === 'committee_queue'
    ).length;

    return {
        totalFindings: findings.length,
        warningCount: findings.filter(
            f => (f.severity ?? '').toLowerCase() === 'warning'
        ).length,
        criticalCount: findings.filter(
            f => (f.severity ?? '').toLowerCase() === 'critical'
        ).length,
        committeeQueueCount,
    };
};

const derivePdMetrics = (executions: PDExecution[]) => {
    const totalPDExecutions = executions.length;

    const pdSuccessCount = executions.filter(e => e.outcome === 'success').length;
    const pdErrorCount = executions.filter(e => e.outcome === 'failure').length;

    const averagePdLatencyMs = Math.round(
        executions.reduce(
            (sum, e) => sum + (e.executionTimeMs ?? 0),
            0
        ) / Math.max(totalPDExecutions, 1)
    );

    return {
        totalPDExecutions,
        pdSuccessCount,
        pdErrorCount,
        averagePdLatencyMs,
    };
};

/* ============================
   Card Builders
============================ */

const buildAlertCards = (
    pdMetrics: ReturnType<typeof derivePdMetrics>,
    findingsMetrics: ReturnType<typeof deriveFindingsMetrics>
) => {
    const findingsHighlight = findingsMetrics.totalFindings > 0;
    return [
        {
            title: 'Total PD Executions',
            value: pdMetrics.totalPDExecutions.toString(),
            icon: <FaUsers className="text-blue-500 text-2xl" />,
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-800',
            route: '/telemetry',
        },
        {
            title: 'Findings Detected',
            value: findingsMetrics.totalFindings.toString(),
            icon: (
                <FaExclamationTriangle
                    className={`${
                        findingsHighlight ? 'text-red-500' : 'text-gray-500'
                    } text-2xl`}
                />
            ),
            bgColor: findingsHighlight ? 'bg-red-100' : 'bg-gray-100',
            textColor: findingsHighlight ? 'text-red-800' : 'text-gray-700',
            route: '/findings',
        },
        {
            title: 'Warnings',
            value: findingsMetrics.warningCount.toString(),
            icon: <FaBell className="text-yellow-500 text-2xl" />,
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-800',
            route: '/findings?severity=warning',
        },
        {
            title: 'Critical Issues',
            value: findingsMetrics.criticalCount.toString(),
            icon: <FaExclamationCircle className="text-orange-600 text-2xl" />,
            bgColor: 'bg-orange-100',
            textColor: 'text-orange-800',
            route: '/findings?severity=critical',
        },
        {
            title: 'Committee Queue',
            value: findingsMetrics.committeeQueueCount.toString(),
            icon: <FaGavel className="text-red-600 text-2xl" />,
            bgColor: 'bg-red-200',
            textColor: 'text-red-900',
            route: '/findings?status=committee_queue',
        },
    ];
};

const buildInsightCards = (
    findings: Finding[],
    findingsMetrics: ReturnType<typeof deriveFindingsMetrics>,
    pdMetrics: ReturnType<typeof derivePdMetrics>,
    pdExecutions: PDExecution[],
    telemetryEvents: TelemetryEvent[],
    complianceStandard: ComplianceStandard
): InsightCard[] => {
    const complianceCategories: Record<ComplianceStandard, string[]> = {
        TEFCA: ['consent', 'identity', 'exchange', 'security', 'governance'],
        IHE: ['xds', 'pix', 'pd', 'mhd', 'pcc'],
        HL7: ['fhir', 'hl7v2', 'hl7v3', 'cda', 'ccda'],
    };

    const applicableFindings = findings.filter(f =>
        complianceCategories[complianceStandard].includes(
            (f.category ?? '').toLowerCase()
        )
    );
    const compliant = applicableFindings.filter(
        f => (f.status ?? '').toLowerCase() === 'closed'
    ).length;
    const compliancePercent = applicableFindings.length === 0
        ? 100
        : Math.round((compliant / applicableFindings.length) * 100);

    const productionFindings = findings.filter(f => {
        const environment = (f.environment ?? '').toLowerCase();
        return environment === 'production' || environment === 'prod';
    });
    const criticalProdOpen = productionFindings.filter(f => {
        const severity = (f.severity ?? '').toLowerCase();
        const status = (f.status ?? '').toLowerCase();
        return severity === 'critical' && status !== 'closed';
    }).length;

    const findingsPer100 = pdMetrics.totalPDExecutions
        ? Math.round(
              (findingsMetrics.totalFindings / pdMetrics.totalPDExecutions) * 100
          )
        : 0;
    const criticalRate = findingsMetrics.totalFindings
        ? Math.round(
              (findingsMetrics.criticalCount / findingsMetrics.totalFindings) * 100
          )
        : 0;

    const telemetryRequestIds = new Set(
        telemetryEvents
            .map(event => event.requestId)
            .filter((requestId): requestId is string => Boolean(requestId))
    );
    const traceableExecutionsCount = pdMetrics.totalPDExecutions
        ? pdExecutions.filter(exec =>
              telemetryRequestIds.has(exec.requestId)
          ).length
        : 0;
    const traceCoveragePercent = pdMetrics.totalPDExecutions
        ? Math.round(
              (traceableExecutionsCount / pdMetrics.totalPDExecutions) * 100
          )
        : 0;

    return [
        {
            title: 'Compliance coverage',
            summary: `${compliancePercent}% compliant (${compliant}/${applicableFindings.length})`,
            detail: `Derived from findings mapped to ${complianceStandard} interoperability requirements.`,
        },
        {
            title: 'Production focus',
            summary: `${productionFindings.length}/${findingsMetrics.totalFindings} findings in production`,
            detail: `${criticalProdOpen} critical issues remain open, including committee-queued cases.`,
        },
        {
            title: 'PD execution health',
            summary: `${Math.round(
                (pdMetrics.pdSuccessCount /
                    Math.max(pdMetrics.totalPDExecutions, 1)) *
                    100
            )}% success rate`,
            detail: `${pdMetrics.pdErrorCount} errors observed; average latency ${pdMetrics.averagePdLatencyMs} ms.`,
        },
        {
            title: 'Findings density',
            summary: `${findingsPer100} findings per 100 PD transactions`,
            detail: `We’re seeing ~${findingsPer100} findings per 100 PD transactions, which indicates moderate operational noise.`,
        },
        {
            title: 'Critical findings rate',
            summary: `${criticalRate}% of findings are critical`,
            detail: `Only ${criticalRate}% of findings are critical, allowing teams to prioritize high-impact issues.`,
        },
        {
            title: 'Traceability coverage',
            summary: `${traceCoveragePercent}% of PD transactions are traceable`,
            detail: `Over ${traceCoveragePercent}% of PD transactions are fully traceable back to raw system events.`,
        },
    ];
};

/* ============================
   Hook
============================ */

const useDashboardMetrics = (
    findings: Finding[],
    pdExecutions: PDExecution[],
    telemetryEvents: TelemetryEvent[],
    complianceStandard: ComplianceStandard
) => {
    console.log('[useDashboardMetrics] pdExecutions', {
        length: pdExecutions.length,
        sample: pdExecutions[0],
    });
    const findingsMetrics = React.useMemo(
        () => deriveFindingsMetrics(findings),
        [findings]
    );

    const pdMetrics = React.useMemo(
        () => derivePdMetrics(pdExecutions),
        [pdExecutions]
    );

    return {
        alertCards: buildAlertCards(
            pdMetrics,
            findingsMetrics
        ),
        insightCards: buildInsightCards(
            findings,
            findingsMetrics,
            pdMetrics,
            pdExecutions,
            telemetryEvents,
            complianceStandard
        ),
    };
};

export default useDashboardMetrics;
