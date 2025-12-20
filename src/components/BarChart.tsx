import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

import { findingsData } from '../features/findings/data/findings.data';

/* ============================
   Derive Findings by Transaction
============================ */

const findingsByTransaction = Object.values(
    findingsData.reduce<
        Record<string, { name: string; findings: number }>
    >((acc, finding) => {
        // Skip findings that do not have a transaction (e.g. CommitteeQueue)
        if (!finding.transaction) return acc;

        if (!acc[finding.transaction]) {
            acc[finding.transaction] = {
                name: finding.transaction,
                findings: 1
            };
        } else {
            acc[finding.transaction].findings += 1;
        }

        return acc;
    }, {})
);

/* ============================
   Component
============================ */

const BarChartComponent: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl shadow p-4 w-full h-[300px]">
            <h2 className="text-lg font-semibold mb-2">
                Findings by Transaction Type
            </h2>

            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={findingsByTransaction}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="findings" fill="#3B82F6" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BarChartComponent;
