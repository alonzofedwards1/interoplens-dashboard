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

import { Finding } from './data/findings.data';
import { useServerData } from '../../lib/ServerDataContext';

/* ============================
   Severity Badge
============================ */

const getSeverityBadge = (severity: Finding['severity']) => {
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

/* ============================
   Sorting Types
============================ */

type SortKey =
    | 'severity'
    | 'organization'
    | 'type'
    | 'transaction'
    | 'environment'
    | 'status'
    | 'detectedAt';

type SortDirection = 'asc' | 'desc';

/* ============================
   Component
============================ */

const ViewAllFindings: React.FC = () => {
    const navigate = useNavigate();
    const { findings } = useServerData();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>('detectedAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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
        return [...findings].sort((a, b) => {
            const aVal = a[sortKey as keyof Finding] ?? '';
            const bVal = b[sortKey as keyof Finding] ?? '';

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [findings, sortKey, sortDirection]);

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
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('organization')}>
                            Organization {renderSortIcon('organization')}
                        </th>
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('type')}>
                            Finding Type {renderSortIcon('type')}
                        </th>
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('transaction')}>
                            Transaction {renderSortIcon('transaction')}
                        </th>
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('environment')}>
                            Environment {renderSortIcon('environment')}
                        </th>
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('status')}>
                            Status {renderSortIcon('status')}
                        </th>
                        <th className="p-3 cursor-pointer" onClick={() => toggleSort('detectedAt')}>
                            Detected {renderSortIcon('detectedAt')}
                        </th>
                        <th className="p-3"></th>
                    </tr>
                    </thead>

                    <tbody>
                    {sortedFindings.map(finding => {
                        const isExpanded = expandedId === finding.id;

                        return (
                            <React.Fragment key={finding.id}>
                                <tr className="border-b">
                                    <td className="p-3">
                                        {getSeverityBadge(finding.severity)}
                                    </td>

                                    <td className="p-3 font-medium">
                                        {finding.organization}
                                    </td>

                                    <td className="p-3">
                                        {finding.type}
                                    </td>

                                    <td className="p-3">
                                        {finding.transaction ?? '—'}
                                    </td>

                                    <td className="p-3 text-gray-600">
                                        {finding.environment.toUpperCase()}
                                    </td>

                                    <td className="p-3">
                                            <span
                                                className={`font-semibold ${
                                                    finding.status === 'compliant'
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                }`}
                                            >
                                                {finding.status === 'compliant'
                                                    ? 'Compliant'
                                                    : 'Non-Compliant'}
                                            </span>
                                    </td>

                                    <td className="p-3 text-gray-600">
                                        {new Date(finding.detectedAt).toLocaleString()}
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
                                                        {finding.description}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Source: {finding.source}
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
