import { FileText, BarChart3 } from "lucide-react";

import { ReportId } from "./reportResolver";

export type ReportListItem = {
    id: ReportId;
    title: string;
    description: string;
    audience: string;
    generatedAt: string;
    environment: "prod" | "test" | "sandbox";
    status: "healthy" | "degraded" | "failing";
    icon: JSX.Element;
};

export const reportCatalog: ReportListItem[] = [
    {
        id: "tefca-readiness",
        title: "TEFCA Readiness Assessment",
        description:
            "Operational readiness assessment against TEFCA exchange expectations with remediation actions.",
        audience: "Compliance, Technical Leadership",
        generatedAt: "2025-02-05T10:15:00Z",
        environment: "prod",
        status: "degraded",
        icon: <BarChart3 size={20} />
    },
    {
        id: "tefca-snapshot",
        title: "TEFCA Interoperability Snapshot",
        description:
            "Executive-level overview of interoperability health, reliability, and top risks for the quarter.",
        audience: "Executives, Stakeholders",
        generatedAt: "2025-02-04T09:00:00Z",
        environment: "test",
        status: "healthy",
        icon: <FileText size={20} />
    }
];

export const formatGeneratedLabel = (generatedAt: string) => {
    const diff = Date.now() - new Date(generatedAt).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days <= 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
};
