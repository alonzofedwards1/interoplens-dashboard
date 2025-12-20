import React from "react";
import { FileText, BarChart3 } from "lucide-react";
import ReportCard from "./ReportCard";
import { ReportId } from "./reportResolver";

interface ReportsGridProps {
    onSelectReport: (id: ReportId) => void;
}

const ReportsGrid: React.FC<ReportsGridProps> = ({ onSelectReport }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ReportCard
                icon={<BarChart3 size={20} />}
                title="TEFCA Readiness Assessment"
                description="Evaluates operational readiness against TEFCA exchange expectations."
                audience="Compliance, Technical Leadership"
                lastGenerated="Today"
                onView={() => onSelectReport("tefca-readiness")}
            />

            <ReportCard
                icon={<FileText size={20} />}
                title="TEFCA Interoperability Snapshot"
                description="Executive-level overview of interoperability health and risk indicators."
                audience="Executives, Stakeholders"
                lastGenerated="Today"
                onView={() => onSelectReport("tefca-snapshot")}
            />
        </div>
    );
};

export default ReportsGrid;
