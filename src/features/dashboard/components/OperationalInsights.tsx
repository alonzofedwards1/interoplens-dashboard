import React from 'react';

import { ComplianceStandard, InsightCard } from '../hooks/useDashboardMetrics';

interface OperationalInsightsProps {
    cards: InsightCard[];
    complianceStandard: 'TEFCA' | 'IHE' | 'HL7';
    onComplianceStandardChange: React.Dispatch<
        React.SetStateAction<'TEFCA' | 'IHE' | 'HL7'>
    >;
}

const OperationalInsights: React.FC<OperationalInsightsProps> = ({
    cards,
    complianceStandard,
    onComplianceStandardChange,
}) => (
    <section aria-labelledby="operational-insights" className="space-y-3">
        <div className="flex items-center justify-between">
            <h2
                id="operational-insights"
                className="text-lg font-semibold text-gray-800"
            >
                Operational insights
            </h2>
            <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>
                    Derived from current findings and PD execution telemetry
                </span>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                    Standard
                    <select
                        value={complianceStandard}
                        onChange={event =>
                            onComplianceStandardChange(
                                event.target.value as ComplianceStandard
                            )
                        }
                        className="border rounded px-2 py-1 text-sm"
                    >
                        <option value="TEFCA">TEFCA</option>
                        <option value="IHE">IHE</option>
                        <option value="HL7">HL7</option>
                    </select>
                </label>
            </div>
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
