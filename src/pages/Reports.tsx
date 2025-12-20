import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import ReportsHeader from "../components/reports/ReportsHeader";
import ReportsFilters from "../components/reports/ReportsFilters";
import ReportsGrid from "../components/reports/ReportsGrid";
import ReportDetailPanel from "../components/reports/ReportDetailPanel";
import { ReportId } from "../components/reports/reportResolver";

const Reports: React.FC = () => {
    const navigate = useNavigate();

    const [dateRange, setDateRange] = useState("30d");
    const [environment, setEnvironment] = useState("prod");
    const [status, setStatus] = useState("all");
    const [selectedReport, setSelectedReport] =
        useState<ReportId | null>(null);

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

            <ReportsHeader />

            <ReportsFilters
                dateRange={dateRange}
                environment={environment}
                status={status}
                onDateRangeChange={setDateRange}
                onEnvironmentChange={setEnvironment}
                onStatusChange={setStatus}
            />

            <ReportsGrid onSelectReport={setSelectedReport} />

            <ReportDetailPanel
                reportId={selectedReport}
                onClose={() => setSelectedReport(null)}
            />
        </div>
    );
};

export default Reports;
