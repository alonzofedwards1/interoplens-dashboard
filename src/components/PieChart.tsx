import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from 'recharts';

import { findingsData, Finding } from '../data/findings.data';

/* ============================
   Derive Compliance Data
============================ */

const compliantCount = findingsData.filter(
    f => f.status === 'compliant'
).length;

const nonCompliantCount = findingsData.filter(
    f => f.status === 'non-compliant'
).length;

const data = [
    { name: 'Compliant', value: compliantCount },
    { name: 'Non-Compliant', value: nonCompliantCount },
];

const COLORS = ['#10B981', '#EF4444'];

/* ============================
   Component
============================ */

const PieChartComponent: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl shadow p-4 w-full h-[300px]">
            <h2 className="text-lg font-semibold mb-2">
                Compliance Status
            </h2>

            <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                    <Tooltip />
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label={({ value }) => value}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={entry.name}
                                fill={COLORS[index]}
                            />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PieChartComponent;
