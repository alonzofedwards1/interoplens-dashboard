import React from "react";
import ReportCard from "./ReportCard";
import { ReportId } from "./reportResolver";
import { formatGeneratedLabel, ReportListItem } from "./reportCatalog";

interface ReportsGridProps {
    reports: ReportListItem[];
    onSelectReport: (id: ReportId) => void;
}

const ReportsGrid: React.FC<ReportsGridProps> = ({ reports, onSelectReport }) => {
    if (!reports.length) {
        return (
            <div className="border rounded-lg bg-white p-8 text-center text-sm text-gray-500">
                No reports match the selected filters. Try a different environment
                or status.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((report) => (
                <ReportCard
                    key={report.id}
                    icon={report.icon}
                    title={report.title}
                    description={report.description}
                    audience={report.audience}
                    lastGenerated={formatGeneratedLabel(report.generatedAt)}
                    status={report.status}
                    environment={report.environment}
                    onView={() => onSelectReport(report.id)}
                />
            ))}
        </div>
    );
};

export default ReportsGrid;
