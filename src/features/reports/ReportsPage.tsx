import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import ReportsHeader from "../../components/reports/ReportsHeader";
import ReportsFilters from "../../components/reports/ReportsFilters";
import ReportsGrid from "../../components/reports/ReportsGrid";
import ReportDetailPanel from "../../components/reports/ReportDetailPanel";
import { ReportId } from "../../components/reports/reportResolver";
import { reportCatalog } from "../../components/reports/reportCatalog";

const isWithinRange = (generatedAt: string, dateRange: string) => {
    if (dateRange === "all" || dateRange === "custom") return true;

    const now = Date.now();
    const generatedMs = new Date(generatedAt).getTime();
    const diffInDays = (now - generatedMs) / (1000 * 60 * 60 * 24);

    switch (dateRange) {
        case "24h":
            return diffInDays <= 1;
        case "7d":
            return diffInDays <= 7;
        case "30d":
        default:
            return diffInDays <= 30;
    }
};

const Reports: React.FC = () => {
    const navigate = useNavigate();

    const [dateRange, setDateRange] = useState("all");
    const [environment, setEnvironment] = useState("all");
    const [status, setStatus] = useState("all");
    const [selectedReport, setSelectedReport] =
        useState<ReportId | null>(null);

    const filteredReports = useMemo(
        () =>
            reportCatalog.filter(
                (report) =>
                    (environment === "all" || report.environment === environment) &&
                    (status === "all" || report.status === status) &&
                    isWithinRange(report.generatedAt, dateRange)
            ),
        [dateRange, environment, status]
    );

    const statusBreakdown = useMemo(
        () =>
            reportCatalog.reduce(
                (acc, report) => {
                    acc[report.status] += 1;
                    return acc;
                },
                { healthy: 0, degraded: 0, failing: 0 }
            ),
        []
    );

    return (
        <div className="p-6 space-y-6">
            {/* ⬅ Back */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>
            </div>

            <ReportsHeader
                total={reportCatalog.length}
                filtered={filteredReports.length}
                statusBreakdown={statusBreakdown}
            />

            <ReportsFilters
                dateRange={dateRange}
                environment={environment}
                status={status}
                onDateRangeChange={setDateRange}
                onEnvironmentChange={setEnvironment}
                onStatusChange={setStatus}
            />

            <ReportsGrid
                reports={filteredReports}
                onSelectReport={setSelectedReport}
            />

            <ReportDetailPanel
                reportId={selectedReport}
                onClose={() => setSelectedReport(null)}
            />
        </div>
    );
};

export default Reports;
