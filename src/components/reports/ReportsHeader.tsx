import React from "react";

interface ReportsHeaderProps {
    total: number;
    filtered: number;
    statusBreakdown: { healthy: number; degraded: number; failing: number };
}

const ReportsHeader: React.FC<ReportsHeaderProps> = ({
                                                         total,
                                                         filtered,
                                                         statusBreakdown
                                                     }) => {
    return (
        <div className="space-y-2">
            <div>
                <h1 className="text-2xl font-semibold">
                    Interoperability Reports
                </h1>
                <p className="text-sm text-gray-500">
                    Canned, exportable intelligence snapshots generated from observed
                    exchange behavior
                </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    Showing {filtered} of {total} reports
                </span>
                <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">
                    Healthy: {statusBreakdown.healthy}
                </span>
                <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                    Degraded: {statusBreakdown.degraded}
                </span>
                <span className="px-2 py-1 rounded-full bg-red-100 text-red-700">
                    Failing: {statusBreakdown.failing}
                </span>
            </div>
        </div>
    );
};

export default ReportsHeader;
