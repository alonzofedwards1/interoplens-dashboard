import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

interface CrumbItem {
    label: string;
    path: string;
}

const segmentLabels: Record<string, string> = {
    dashboard: "Dashboard",
    findings: "Findings",
    "pd-executions": "PD executions",
    "integration-issues": "Integration issues",
    oids: "OID directory",
    committee: "Committee",
    "knowledge-base": "Knowledge base",
    reports: "Reports",
    settings: "Settings",
    alerts: "Alerts",
};

const Breadcrumbs: React.FC = () => {
    const location = useLocation();

    const crumbs = useMemo<CrumbItem[]>(() => {
        const segments = location.pathname
            .split("/")
            .filter(Boolean);

        const pathSegments = segments.length ? segments : ["dashboard"];

        return pathSegments.map((segment, index) => {
            const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
            const label = segmentLabels[segment] ?? segment;

            return { label, path };
        });
    }, [location.pathname]);

    return (
        <nav aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
                {crumbs.map((crumb, index) => (
                    <li key={crumb.path} className="flex items-center space-x-2">
                        {index > 0 && <span className="text-gray-400">/</span>}
                        <Link
                            to={crumb.path}
                            className="hover:text-blue-700 capitalize"
                        >
                            {crumb.label}
                        </Link>
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
