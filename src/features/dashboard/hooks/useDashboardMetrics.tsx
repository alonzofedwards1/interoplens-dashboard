import React, { type ReactNode } from 'react';
import {
    FaUsers,
    FaExclamationTriangle,
    FaBell,
    FaExclamationCircle,
    FaGavel,
} from 'react-icons/fa';

import { Finding } from '../../findings/data/findings.data';
import { PDExecution } from '../../pd-executions/data/pdExecutions.data';
import { CommitteeQueueItem } from '../../committee/data/committeeQueue.data';

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

/* ============================
   Metric Derivers
============================ */

const deriveFindingsMetrics = (findings: Finding[]) => ({
    totalFindings: findings.length,
    warningCount: findings.filter(f => f.severity === 'warning').length,
    criticalCount: findings.filter(f => f.severity === 'critical').length,
});

const deriveCommitteeMetrics = (queue: CommitteeQueueItem[]) => ({
    committeeCount: queue.length,
});

const derivePdMetrics = (executions: PDExecution[]) => {
    const totalPDExecutions = executions.length;

    const pdSuccessCount = executions.filter(e => e.outcome === 'success').length;
    const pdErrorCount = executions.filter(e => e.outcome === 'error').length;

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
    findingsMetrics: ReturnType<typeof deriveFindingsMetrics>,
    committeeMetrics: ReturnType<typeof deriveCommitteeMetrics>
): AlertCard[] => [
    {
        title: 'Total PD Executions',
        value: pdMetrics.totalPDExecutions.toString(),
        icon: <FaUsers className="text-blue-500 text-2xl" />,
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        route: '/pd-executions',
    },
    {
        title: 'Findings Detected',
        value: findingsMetrics.totalFindings.toString(),
        icon: <FaExclamationTriangle className="text-red-500 text-2xl" />,
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
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
        value: committeeMetrics.committeeCount.toString(),
        icon: <FaGavel className="text-red-600 text-2xl" />,
        bgColor: 'bg-red-200',
        textColor: 'text-red-900',
        route: '/committee',
    },
];

const buildInsightCards = (
    findings: Finding[],
    findingsMetrics: ReturnType<typeof deriveFindingsMetrics>,
    pdMetrics: ReturnType<typeof derivePdMetrics>
): InsightCard[] => {
    const compliant = findings.filter(f => f.status === 'compliant').length;

    return [
        {
            title: 'Compliance coverage',
            summary: `${Math.round(
                (compliant / Math.max(findingsMetrics.totalFindings, 1)) * 100
            )}% compliant`,
            detail: 'Review non-compliant findings to close gaps.',
        },
        {
            title: 'PD execution health',
            summary: `${Math.round(
                (pdMetrics.pdSuccessCount /
                    Math.max(pdMetrics.totalPDExecutions, 1)) *
                100
            )}% success rate`,
            detail: `${pdMetrics.pdErrorCount} errors observed; avg latency ${pdMetrics.averagePdLatencyMs} ms.`,
        },
    ];
};

/* ============================
   Hook
============================ */

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

    return {
        alertCards: buildAlertCards(
            pdMetrics,
            findingsMetrics,
            committeeMetrics
        ),
        insightCards: buildInsightCards(
            findings,
            findingsMetrics,
            pdMetrics
        ),
    };
};

export default useDashboardMetrics;
