import React, { useEffect, useMemo, useState } from "react";
import Pagination from "../../../components/Pagination";

interface FindingSummary {
    id: string;
    severity: "OK" | "WARNING" | "CRITICAL";
    summary: string;
    lastObserved: string;
    executionId?: string;
}

interface Props {
    findings: FindingSummary[];
}

const LinkedFindingsTable = ({ findings }: Props) => {
    const [page, setPage] = useState(1);
    const pageSize = 5;

    const totalPages = Math.max(1, Math.ceil(findings.length / pageSize));

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const pagedFindings = useMemo(() => {
        const start = (page - 1) * pageSize;
        return findings.slice(start, start + pageSize);
    }, [findings, page]);

    if (!findings.length) {
        return (
            <div className="rounded-2xl border bg-white p-4 text-sm text-gray-500 shadow">
                No findings associated with this OID.
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-white p-4 shadow space-y-3">
            <h2 className="text-lg font-semibold">Linked Findings</h2>

            <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-100">
                <tr className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <th className="p-3 text-left">Severity</th>
                    <th className="p-3 text-left">Summary</th>
                    <th className="p-3 text-left">Last Observed</th>
                </tr>
                </thead>
                <tbody>
                {pagedFindings.map(f => (
                    <tr key={f.id} className="border-t">
                        <td className="p-3">{f.severity}</td>
                        <td className="p-3 text-gray-700">{f.summary}</td>
                        <td className="p-3 text-gray-600">{f.lastObserved}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </div>
    );
};

export default LinkedFindingsTable;
