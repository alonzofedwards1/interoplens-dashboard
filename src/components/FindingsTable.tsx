import React from 'react';
import { useNavigate } from 'react-router-dom';

import { findingsData, Finding } from '../data/findings.data';

/* ============================
   Derive Recent Findings
============================ */

const recentFindings: Finding[] = findingsData
    .slice()
    .sort(
        (a, b) =>
            new Date(b.detectedAt).getTime() -
            new Date(a.detectedAt).getTime()
    )
    .slice(0, 5);

/* ============================
   Helpers
============================ */

const getSeverityLabel = (severity: Finding['severity']) => {
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

const getStatusLabel = (status: Finding['status']) => (
    <span
        className={`font-semibold ${
            status === 'compliant'
                ? 'text-green-600'
                : 'text-red-600'
        }`}
    >
        {status === 'compliant' ? 'Compliant' : 'Non-Compliant'}
    </span>
);

/* ============================
   Component
============================ */

const FindingsTable: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-2xl shadow p-4 mt-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                    Recent Findings
                </h2>

                <button
                    onClick={() => navigate('/findings')}
                    className="text-sm text-blue-600 hover:underline"
                >
                    View All
                </button>
            </div>

            <table className="w-full text-sm text-left">
                <thead>
                <tr className="text-gray-600 border-b">
                    <th className="py-2">State</th>
                    <th className="py-2">Organization</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Detected</th>
                    <th className="py-2">Status</th>
                </tr>
                </thead>

                <tbody>
                {recentFindings.map(finding => (
                    <tr
                        key={finding.id}
                        className="border-b last:border-b-0"
                    >
                        <td className="py-2">
                            {getSeverityLabel(finding.severity)}
                        </td>

                        <td className="py-2 font-medium text-gray-800">
                            {finding.organization}
                        </td>

                        <td className="py-2">
                            {finding.type}
                        </td>

                        <td className="py-2 text-gray-600">
                            {new Date(finding.detectedAt).toLocaleString()}
                        </td>

                        <td className="py-2">
                            {getStatusLabel(finding.status)}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default FindingsTable;
