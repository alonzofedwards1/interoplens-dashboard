import React from 'react';
import { useNavigate } from 'react-router-dom';

import { committeeQueueData } from './data/committeeQueue.data';
import { committeeStatusStyles } from './data/committeeStatus';

const CommitteeQueue: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="p-6 space-y-6">
            <div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-sm text-blue-600 hover:underline mb-2"
                >
                    ← Back to Dashboard
                </button>

                <h1 className="text-2xl font-semibold">Committee Review Queue</h1>
                <p className="text-gray-600">
                    Findings requiring governance-level review and decision.
                </p>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                    <tr>
                        <th className="px-4 py-3 text-left">Case ID</th>
                        <th className="px-4 py-3 text-left">Organization</th>
                        <th className="px-4 py-3 text-left">Issue Type</th>
                        <th className="px-4 py-3 text-left">Severity</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Decision Target</th>
                        <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {committeeQueueData.map((item) => (
                        <tr
                            key={item.id}
                            className="border-t hover:bg-gray-50"
                        >
                            <td className="px-4 py-3 font-mono">{item.id}</td>
                            <td className="px-4 py-3">{item.organization}</td>
                            <td className="px-4 py-3">{item.issueType}</td>
                            <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs">
                    {item.severity}
                  </span>
                            </td>
                            <td className="px-4 py-3">
                  <span
                      className={`px-2 py-0.5 rounded text-xs ${
                          committeeStatusStyles[item.status]
                      }`}
                  >
                    {item.status}
                  </span>
                            </td>
                            <td className="px-4 py-3">{item.decisionTarget}</td>
                            <td className="px-4 py-3 text-right">
                                <button
                                    onClick={() => navigate(`/committee/${item.id}`)}
                                    className="text-blue-600 hover:underline font-medium"
                                >
                                    Open Case →
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CommitteeQueue;
