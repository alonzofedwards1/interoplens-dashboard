import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaExclamationCircle,
    FaExclamationTriangle,
    FaChevronDown,
    FaChevronUp,
} from 'react-icons/fa';

import { Finding } from '../types/findings';

/* ============================
   Derive Example Findings
============================ */

const buildExampleFindings = (findings: Finding[]) =>
    findings
        .filter(f => f.severity !== 'ok')
        .sort(
            (a, b) =>
                new Date(b.detectedAt).getTime() -
                new Date(a.detectedAt).getTime()
        )
        .slice(0, 3);

/* ============================
   Helpers
============================ */

const getSeverityMeta = (severity: Finding['severity']) => {
    switch (severity) {
        case 'critical':
            return {
                icon: <FaExclamationCircle className="text-red-500 mt-1" />,
                label: 'Critical'
            };
        case 'warning':
            return {
                icon: <FaExclamationTriangle className="text-yellow-400 mt-1" />,
                label: 'Warning'
            };
        default:
            return null;
    }
};

/* ============================
   Component
============================ */

type Props = { findings: Finding[] };

const ExampleFindings: React.FC<Props> = ({ findings }) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const exampleFindings = React.useMemo(
        () => buildExampleFindings(findings),
        [findings]
    );

    const toggleExpand = (index: number) => {
        setExpandedIndex(prev => (prev === index ? null : index));
    };

    return (
        <div className="bg-white rounded-xl shadow p-4 w-full">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-semibold text-gray-800">
                    Example Findings
                </h2>

                <Link
                    to="/findings"
                    className="text-xs text-blue-600 hover:underline"
                >
                    View All Findings
                </Link>
            </div>

            <div className="space-y-3">
                {exampleFindings.map((finding, idx) => {
                    const meta = getSeverityMeta(finding.severity);
                    const isExpanded = expandedIndex === idx;

                    if (!meta) return null;

                    return (
                        <div
                            key={finding.id}
                            className="bg-gray-50 border border-gray-200 rounded-md"
                        >
                            <div
                                className="flex justify-between items-start p-3 cursor-pointer"
                                onClick={() => toggleExpand(idx)}
                            >
                                <div className="flex gap-2 text-sm text-gray-800">
                                    {meta.icon}

                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">
                                            <div className="font-medium text-gray-700">
                                                {finding.organization}
                                            </div>
                                        </div>

                                        <div className="font-medium">
                                            {finding.title}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                    <span>{meta.label}</span>
                                    {isExpanded ? (
                                        <FaChevronUp className="text-gray-400 text-xs" />
                                    ) : (
                                        <FaChevronDown className="text-gray-400 text-xs" />
                                    )}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="px-4 pb-3 pt-2 text-xs text-gray-600 border-t bg-white">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <span className="font-medium text-gray-700">
                                                Type
                                            </span>
                                            <div>{finding.type}</div>
                                        </div>

                                        <div>
                                            <span className="font-medium text-gray-700">
                                                Environment
                                            </span>
                                            <div>{finding.environment.toUpperCase()}</div>
                                        </div>

                                        <div>
                                            <span className="font-medium text-gray-700">
                                                Detected At
                                            </span>
                                            <div>
                                                {new Date(finding.detectedAt).toUTCString()}
                                            </div>
                                        </div>

                                        <div>
                                            <span className="font-medium text-gray-700">
                                                Source
                                            </span>
                                            <div>{finding.source}</div>
                                        </div>

                                        <div className="col-span-2">
                                            <span className="font-medium text-gray-700">
                                                Description
                                            </span>
                                            <div>{finding.description}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 text-center">
                <Link to="/findings">
                    View All Findings
                </Link>
            </div>
        </div>
    );
};

export default ExampleFindings;
