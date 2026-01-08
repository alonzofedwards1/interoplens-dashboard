import React from 'react';

import { Finding } from '../../findings/data/findings.data';
import { PDExecution } from '../../pd-executions/data/pdExecutions.data';
import { CommitteeQueueItem } from '../../committee/data/committeeQueue.data';

type AlertIconKey =
    | 'users'
    | 'findings'
    | 'warning'
    | 'critical'
    | 'committee';

interface AlertCardData {
    title: string;
    value: string;
    iconKey: AlertIconKey;
    bgColor: string;
    textColor: string;
    route: string;
}

interface InsightCardData {
    title: string;
    summary: string;
    detail: string;
}

const deriveFindingsMetrics = (findings: Finding[]) => {
    const totalFindings = findings.length;
    const warningCount = findings.filter(f => f.severity === 'warning').length;
    const criticalCount = findings.filter(f => f.severity === 'critical').length;

    return { totalFindings, warningCount, criticalCount };
};

const deriveCommitteeMetrics = (queue: CommitteeQueueItem[]) => ({
    committeeCount: queue.length,
});

const derivePdMetrics = (executions: PDExecution[]) => {
    const totalPDExecutions = executions.length;
    const pdSuccessCount = executions.filter(
        execution => execution.outcome === 'success'
    ).length;
    const pdErrorCount = executions.filter(
        execution => execution.outcome === 'error'
    ).length;
    const averagePdLatencyMs = Math.round(
        executions.reduce((sum, execution) => sum + execution.executionTimeMs, 0) /
            Math.max(totalPDExecutions, 1)
    );

    return { totalPDExecutions, pdSuccessCount, pdErrorCount, averagePdLatencyMs };
};

const buildAlertCards = (
    pdMetrics: ReturnType<typeof derivePdMetrics>,
    findingsMetrics: ReturnType<typeof deriveFindingsMetrics>,
    committeeMetrics: ReturnType<typeof deriveCommitteeMetrics>
): AlertCardData[] => [
    {
        title: 'Total PD Executions',
        value: pdMetrics.totalPDExecutions.toString(),
        iconKey: 'users',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        route: '/telemetry',
    },
    {
        title: 'Findings Detected',
        value: findingsMetrics.totalFindings.toString(),
        iconKey: 'findings',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        route: '/findings',
    },
    {
        title: 'Warnings',
        value: findingsMetrics.warningCount.toString(),
        iconKey: 'warning',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        route: '/findings?severity=warning',
    },
    {
        title: 'Critical Issues',
        value: findingsMetrics.criticalCount.toString(),
        iconKey: 'critical',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
        route: '/findings?severity=critical',
    },
    {
        title: 'CommitteeQueue',
        value: committeeMetrics.committeeCount.toString(),
        iconKey: 'committee',
        bgColor: 'bg-red-200',
        textColor: 'text-red-900',
        route: '/committee',
    },
];

const buildInsightCards = (
    findings: Finding[],
    findingsMetrics: ReturnType<typeof deriveFindingsMetrics>,
    pdMetrics: ReturnType<typeof derivePdMetrics>
): InsightCardData[] => {
    const compliant = findings.filter(
        finding => finding.status === 'compliant'
    ).length;
    const complianceRate = Math.round(
        (compliant / Math.max(findingsMetrics.totalFindings, 1)) * 100
    );
    const prodFindings = findings.filter(
        finding => finding.environment === 'prod'
    ).length;

    return [
        {
            title: 'Compliance coverage',
            summary: `${complianceRate}% compliant (${compliant}/${findingsMetrics.totalFindings})`,
            detail: 'Most findings are compliant; review non-compliant items to close remaining gaps.',
        },
        {
            title: 'Production focus',
            summary: `${prodFindings}/${findingsMetrics.totalFindings} findings in production`,
            detail: `${findingsMetrics.criticalCount} critical issues remain open, including committee-queued cases that need decisions.`,
        },
        {
            title: 'PD execution health',
            summary: `${Math.round((pdMetrics.pdSuccessCount / Math.max(pdMetrics.totalPDExecutions, 1)) * 100)}% success rate`,
            detail: `${pdMetrics.pdErrorCount} errors observed; average latency ${pdMetrics.averagePdLatencyMs} ms. Track retries tied to critical findings.`,
        },
    ];
};

const useDashboardMetrics = (
    findings: Finding[],
    pdExecutions: PDExecution[],
    committeeQueue: CommitteeQueueItem[]
) => {
    const findingsMetrics = React.useMemo(
        () => deriveFindingsMetrics(findings),
        [findings]
    );

    const committeeMetrics = React.useMemo(
        () => deriveCommitteeMetrics(committeeQueue),
        [committeeQueue]
    );

    const pdMetrics = React.useMemo(
        () => derivePdMetrics(pdExecutions),
        [pdExecutions]
    );

    const alertCards = React.useMemo(
        () => buildAlertCards(pdMetrics, findingsMetrics, committeeMetrics),
        [committeeMetrics, findingsMetrics, pdMetrics]
    );

    const insightCards = React.useMemo(
        () => buildInsightCards(findings, findingsMetrics, pdMetrics),
        [findings, findingsMetrics, pdMetrics]
    );

    return {
        alertCards,
        insightCards,
    };
};

export type { AlertCardData, AlertIconKey, InsightCardData };
export default useDashboardMetrics;
