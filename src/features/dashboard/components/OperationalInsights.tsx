import React from 'react';

import { InsightCardData } from '../hooks/useDashboardMetrics';

interface OperationalInsightsProps {
    cards: InsightCardData[];
}

const OperationalInsights: React.FC<OperationalInsightsProps> = ({ cards }) => (
    <section aria-labelledby="operational-insights" className="space-y-3">
        <div className="flex items-center justify-between">
            <h2
                id="operational-insights"
                className="text-lg font-semibold text-gray-800"
            >
                Operational insights
            </h2>
            <span className="text-sm text-gray-500">
                Derived from current findings and PD execution telemetry
            </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {cards.map(card => (
                <article
                    key={card.title}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                    <div className="text-sm font-semibold text-gray-700">
                        {card.title}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                        {card.summary}
                    </div>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                        {card.detail}
                    </p>
                </article>
            ))}
        </div>
    </section>
);

export default OperationalInsights;
