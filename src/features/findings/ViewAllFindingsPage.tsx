import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Filters, { FiltersState } from "../../components/Filters";
import {
    FaChevronDown,
    FaChevronUp,
    FaSort,
    FaSortUp,
    FaSortDown,
} from "react-icons/fa";

import { Finding } from "../../types/findings";
import { useServerData } from "../../lib/ServerDataContext";
import { TransactionLink } from "../../components/TransactionLink";
import Pagination from "../../components/Pagination";

/* ============================
   Local Types
============================ */

interface OrganizationOption {
    id: string;
    name: string;
}

/* ============================
   Helpers
============================ */

const getSeverityBadge = (severity?: Finding["severity"]) => {
    switch (severity) {
        case "critical":
            return (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">
                    Critical
                </span>
            );
        case "warning":
            return (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                    Warning
                </span>
            );
        default:
            return (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
                    OK
                </span>
            );
    }
};

const safeUpper = (value?: string | null) => (value ? value.toUpperCase() : "—");

const formatDateTime = (value?: string | null) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

/* ============================
   Sorting Types
============================ */

type SortKey =
    | "severity"
    | "executionType"
    | "organization"
    | "category"
    | "summary"
    | "status"
    | "firstSeenAt"
    | "lastSeenAt";

type SortDirection = "asc" | "desc";

/* ============================
   Component
============================ */

const ViewAllFindingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { findings: rawFindings } = useServerData();

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>("lastSeenAt");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const severityParam = searchParams.get("severity");
    const severityFilter =
        severityParam === "warning" || severityParam === "critical"
            ? severityParam
            : "";
    const [filters, setFilters] = useState<FiltersState>({
        organization: "",
        status: "",
    });

    const findings: Finding[] = useMemo(
        () => (Array.isArray(rawFindings) ? rawFindings : []),
        [rawFindings]
    );

    /* ============================
       DERIVE ORGANIZATIONS
    ============================ */

    const organizations: OrganizationOption[] = useMemo(() => {
        const map = new Map<string, OrganizationOption>();

        findings.forEach((f) => {
            if (f.organization?.id && f.organization?.name) {
                map.set(f.organization.id, {
                    id: f.organization.id,
                    name: f.organization.name,
                });
            }
        });

        return Array.from(map.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }, [findings]);

    /* ============================
       FILTER
    ============================ */

    const filteredFindings = useMemo(() => {
        return findings.filter((f) => {
            if (
                filters.organization &&
                f.organization?.id !== filters.organization
            ) {
                return false;
            }

            if (filters.status && f.status !== filters.status) {
                return false;
            }

            if (severityFilter && f.severity !== severityFilter) {
                return false;
            }

            return true;
        });
    }, [findings, filters, severityFilter]);

    /* ============================
       SORT
    ============================ */

    const sortedFindings = useMemo(() => {
        const getSortValue = (finding: Finding) => {
            switch (sortKey) {
                case "organization":
                    return finding.organization?.name ?? "";
                case "firstSeenAt":
                    return new Date(finding.firstSeenAt ?? 0).getTime();
                case "lastSeenAt":
                    return new Date(finding.lastSeenAt ?? 0).getTime();
                case "severity":
                    return finding.severity ?? "";
                case "executionType":
                    return finding.executionType ?? "";
                case "category":
                    return finding.category ?? "";
                case "summary":
                    return finding.summary ?? "";
                case "status":
                    return finding.status ?? "";
                default:
                    return "";
            }
        };

        return [...filteredFindings].sort((a, b) => {
            const aVal = getSortValue(a);
            const bVal = getSortValue(b);

            if (typeof aVal === "number" && typeof bVal === "number") {
                return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
            }

            return sortDirection === "asc"
                ? String(aVal).localeCompare(String(bVal))
                : String(bVal).localeCompare(String(aVal));
        });
    }, [filteredFindings, sortKey, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(sortedFindings.length / pageSize));

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const pagedFindings = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sortedFindings.slice(start, start + pageSize);
    }, [page, sortedFindings]);

    return (
        <div className="p-6 space-y-4">
            <button
                onClick={() => navigate("/dashboard")}
                className="text-sm text-blue-600 hover:underline"
            >
                Back to Dashboard
            </button>

            <div>
                <h1 className="text-xl font-semibold text-gray-800">
                    All Findings
                </h1>
                <p className="text-sm text-gray-500">
                    Aggregated interoperability findings across organizations
                </p>
            </div>

            <Filters
                value={filters}
                onChange={setFilters}
                organizations={organizations}
            />

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b">
                    <tr className="text-gray-600">
                        <th className="p-3">State</th>
                        <th className="p-3">Execution</th>
                        <th className="p-3">Organization</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Summary</th>
                        <th className="p-3">Transaction</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Last Seen</th>
                        <th className="p-3"></th>
                    </tr>
                    </thead>

                    <tbody>
                    {pagedFindings.map((finding) => {
                        const isExpanded = expandedId === finding.id;

                        return (
                            <React.Fragment key={finding.id}>
                                <tr className="border-b">
                                    <td className="p-3">
                                        {getSeverityBadge(finding.severity)}
                                    </td>
                                    <td className="p-3">
                                        {safeUpper(finding.executionType)}
                                    </td>
                                    <td className="p-3">
                                        {finding.organization?.name ?? "—"}
                                    </td>
                                    <td className="p-3">
                                        {safeUpper(finding.category)}
                                    </td>
                                    <td className="p-3">
                                        {finding.summary}
                                    </td>
                                    <td className="p-3">
                                        {finding.executionId ? (
                                            <TransactionLink
                                                id={finding.executionId}
                                            />
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {safeUpper(finding.status)}
                                    </td>
                                    <td className="p-3">
                                        {formatDateTime(
                                            finding.lastSeenAt
                                        )}
                                    </td>
                                    <td className="p-3 text-right">
                                        <button
                                            onClick={() =>
                                                setExpandedId(
                                                    isExpanded
                                                        ? null
                                                        : finding.id
                                                )
                                            }
                                        >
                                            {isExpanded ? (
                                                <FaChevronUp />
                                            ) : (
                                                <FaChevronDown />
                                            )}
                                        </button>
                                    </td>
                                </tr>

                                {isExpanded && (
                                    <tr className="bg-gray-50 border-b">
                                        <td
                                            colSpan={9}
                                            className="p-4 text-sm text-gray-700"
                                        >
                                            {finding.technicalDetail ?? "—"}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                    </tbody>
                </table>
            </div>
            <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </div>
    );
};

export default ViewAllFindingsPage;
