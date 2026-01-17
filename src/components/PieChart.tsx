import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from 'recharts';

import { Finding } from '../types/findings';

/* ============================
   Derive Compliance Data
============================ */

const buildChartData = (findings: Finding[]) => {
    const compliantCount = findings.filter(
        f => f.status === 'compliant'
    ).length;

    const nonCompliantCount = findings.filter(
        f => f.status === 'non-compliant'
    ).length;

    return [
        { name: 'Compliant', value: compliantCount },
        { name: 'Non-Compliant', value: nonCompliantCount },
    ];
};

const COLORS = ['#10B981', '#EF4444'];

/* ============================
   Component
============================ */

type Props = { findings: Finding[] };

const PieChartComponent: React.FC<Props> = ({ findings }) => {
    const data = React.useMemo(() => buildChartData(findings), [findings]);

    return (
        <div className="bg-white rounded-2xl shadow p-4 w-full h-[300px]">
            <h2 className="text-lg font-semibold mb-2">
                Compliance Status
            </h2>

            <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
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
        </div>
    );
};

export default PieChartComponent;
