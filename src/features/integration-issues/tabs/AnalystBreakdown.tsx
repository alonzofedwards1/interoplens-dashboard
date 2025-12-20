import { issueSummaryData } from "../data/issueSummary.data";

const AnalystBreakdown = () => {
    const {
        failureCategories,
        notableTrends,
        observations,
        riskSignals,
        rootCauseHypotheses,
        recommendations,
    } = issueSummaryData.analystBreakdown;

    return (
        <div className="space-y-6">

            {/* Failure Categories */}
            <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-2">
                    Failure Categories
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                    {failureCategories.map(item => (
                        <li key={item.label}>
                            • {item.label} — {item.percentage}%
                        </li>
                    ))}
                </ul>
            </div>

            {/* Notable Trends */}
            <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-2">
                    Notable Trends
                </h3>
                <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
                    {notableTrends.map((trend, index) => (
                        <li key={index}>{trend}</li>
                    ))}
                </ul>
            </div>

            {/* Analyst Observations */}
            <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-2">
                    Analyst Observations
                </h3>
                <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
                    {observations.map((obs, index) => (
                        <li key={index}>{obs}</li>
                    ))}
                </ul>
            </div>

            {/* Emerging Risk Signals */}
            <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-2">
                    Emerging Risk Signals
                </h3>
                <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
                    {riskSignals.map((risk, index) => (
                        <li key={index}>{risk}</li>
                    ))}
                </ul>
            </div>

            {/* Root Cause Hypotheses */}
            <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-2">
                    Root Cause Hypotheses
                </h3>
                <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
                    {rootCauseHypotheses.map((cause, index) => (
                        <li key={index}>{cause}</li>
                    ))}
                </ul>
            </div>

            {/* Analyst Recommendations */}
            <div className="bg-white p-5 rounded shadow">
                <h3 className="font-semibold mb-2">
                    Analyst Recommendations
                </h3>
                <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
                    {recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                    ))}
                </ul>
            </div>

        </div>
    );
};

export default AnalystBreakdown;
