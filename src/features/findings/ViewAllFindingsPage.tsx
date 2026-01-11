import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Filters from '../../components/Filters';
import {
    FaChevronDown,
    FaChevronUp,
    FaExclamationCircle,
    FaExclamationTriangle,
    FaSort,
    FaSortUp,
    FaSortDown,
} from 'react-icons/fa';

import { Finding } from '../../types/findings';
import { useServerData } from '../../lib/ServerDataContext';

/* ============================
   Severity Badge
============================ */

const getSeverityBadge = (severity?: Finding['severity']) => {
    switch (severity) {
        case 'critical':
            return (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">
                    Critical
                </span>
            );
        case 'warning':
            return (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                    Warning
                </span>
            );
        default:
            return (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
                    OK
                </span>
            );
    }
};

const safeUpper = (value?: string | null) => {
    return value ? value.toUpperCase() : '—';
};

const formatDateTime = (value?: string | null) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
};

/* ============================
   Sorting Types
============================ */

type SortKey =
    | 'severity'
    | 'executionType'
    | 'category'
    | 'summary'
    | 'status'
    | 'firstSeenAt'
    | 'lastSeenAt';

type SortDirection = 'asc' | 'desc';

/* ============================
   Component
============================ */

const ViewAllFindings: React.FC = () => {
    const navigate = useNavigate();
    const { findings: rawFindings } = useServerData();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>('lastSeenAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const findings = useMemo(
        () => (Array.isArray(rawFindings) ? rawFindings : []),
        [rawFindings]
    );

    const toggleExpand = (id: string) => {
        setExpandedId(prev => (prev === id ? null : id));
    };

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const renderSortIcon = (key: SortKey) => {
        if (sortKey !== key) return <FaSort className="inline ml-1 text-gray-400" />;
        return sortDirection === 'asc'
            ? <FaSortUp className="inline ml-1" />
            : <FaSortDown className="inline ml-1" />;
    };

    const sortedFindings = useMemo(() => {
        const getSortValue = (finding: Finding) => {
            switch (sortKey) {
                case 'firstSeenAt':
                    return new Date(finding.firstSeenAt ?? 0).getTime();
                case 'lastSeenAt':
                    return new Date(finding.lastSeenAt ?? 0).getTime();
                case 'severity':
                    return finding.severity ?? '';
                case 'executionType':
                    return finding.executionType ?? '';
                case 'category':
                    return finding.category ?? '';
                case 'summary':
                    return finding.summary ?? '';
                case 'status':
                    return finding.status ?? '';
                default:
                    return '';
            }
        };

        return [...findings].sort((a, b) => {
            const aVal = getSortValue(a);
            const bVal = getSortValue(b);

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            }

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [findings, sortDirection, sortKey]);

    console.log('Findings payload', findings);

    return (
        <div className="p-6 space-y-4">
            <button
                onClick={() => navigate('/dashboard')}
                className="text-sm text-blue-600 hover:underline"
            >
                Back to Dashboard
            </button>

            <div>
                <h1 className="text-xl font-semibold text-gray-800">
                    All Findings
                </h1>
                <p className="text-sm text-gray-500">
                    Aggregated interoperability findings across organizations
                </p>
            </div>

            <Filters />

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b">
                    <tr className="text-gray-600">
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('severity')}>
                            State {renderSortIcon('severity')}
                        </th>
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('executionType')}>
                            Execution Type {renderSortIcon('executionType')}
                        </th>
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('category')}>
                            Category {renderSortIcon('category')}
                        </th>
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('summary')}>
                            Summary {renderSortIcon('summary')}
                        </th>
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('status')}>
                            Status {renderSortIcon('status')}
                        </th>
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('firstSeenAt')}>
                            First Seen {renderSortIcon('firstSeenAt')}
                        </th>
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('lastSeenAt')}>
                            Last Seen {renderSortIcon('lastSeenAt')}
                        </th>
                        <th className="p-3"></th>
                    </tr>
                    </thead>

                    <tbody>
                    {Array.isArray(sortedFindings) && sortedFindings.map((finding: Finding) => {
                        const isExpanded = expandedId === finding.id;

                        return (
                            <React.Fragment key={finding.id}>
                                <tr className="border-b">
                                    <td className="p-3">
                                        {getSeverityBadge(finding.severity)}
                                    </td>

                                    <td className="p-3 font-medium">
                                        {safeUpper(finding.executionType)}
                                    </td>

                                    <td className="p-3">
                                        {safeUpper(finding.category)}
                                    </td>

                                    <td className="p-3">
                                        {finding.summary ?? '—'}
                                    </td>

                                    <td className="p-3 text-gray-600">
                                        <span
                                            className={`font-semibold ${
                                                finding.status === 'compliant'
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }`}
                                        >
                                            {finding.status === 'compliant'
                                                ? 'Compliant'
                                                : finding.status
                                                  ? safeUpper(finding.status)
                                                  : '—'}
                                        </span>
                                    </td>

                                    <td className="p-3 text-gray-600">
                                        {formatDateTime(finding.firstSeenAt)}
                                    </td>

                                    <td className="p-3 text-gray-600">
                                        {formatDateTime(finding.lastSeenAt)}
                                    </td>

                                    <td className="p-3 text-right">
                                        <button
                                            onClick={() => toggleExpand(finding.id)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                        </button>
                                    </td>
                                </tr>

                                {isExpanded && (
                                    <tr className="bg-gray-50 border-b">
                                        <td colSpan={8} className="p-4">
                                            <div className="flex gap-3 text-sm text-gray-700">
                                                {finding.severity === 'critical' ? (
                                                    <FaExclamationCircle className="text-red-500 mt-1" />
                                                ) : finding.severity === 'warning' ? (
                                                    <FaExclamationTriangle className="text-yellow-400 mt-1" />
                                                ) : null}

                                                <div>
                                                    <div className="font-medium mb-1">
                                                        Finding Details
                                                    </div>
                                                    <div className="text-gray-600 mb-2">
                                                        {finding.technicalDetail ?? '—'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Recommended action: {finding.recommendedAction ?? '—'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Execution ID: {finding.executionId ?? '—'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ViewAllFindings;
