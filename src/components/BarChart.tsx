import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

import { Finding } from '@/types';

/* ============================
   Color Palette
============================ */

const CATEGORY_COLORS = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#14B8A6', // teal
];

/* ============================
   Derive Findings by Category
============================ */

type ChartRow = {
    name: string;
    findings: number;
};

const buildChartData = (findings: Finding[]): ChartRow[] =>
    Object.values(
        findings.reduce<Record<string, ChartRow>>((acc, finding) => {
            const category = finding.category ?? 'Uncategorized';

            if (!acc[category]) {
                acc[category] = {
                    name: category,
                    findings: 1,
                };
            } else {
                acc[category].findings += 1;
            }

            return acc;
        }, {})
    ).sort((a, b) => b.findings - a.findings); // nicer ordering

/* ============================
   Component
============================ */

type Props = {
    findings: Finding[];
};

const BarChartComponent: React.FC<Props> = ({ findings }) => {
    const findingsByCategory = useMemo(
        () => buildChartData(findings),
        [findings]
    );

    return (
        <div className="bg-white rounded-2xl shadow p-4 w-full h-[300px]">
            <h2 className="text-lg font-semibold mb-2">
                Findings by Category
            </h2>

            {findingsByCategory.length === 0 ? (
                <div className="text-sm text-gray-500 h-full flex items-center justify-center">
                    No findings available
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={findingsByCategory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="name"
                            angle={-25}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="findings">
                            {findingsByCategory.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default BarChartComponent;
