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
            <div className="border rounded p-4 bg-white text-sm text-gray-500">
                No findings associated with this OID.
            </div>
        );
    }

    return (
        <div className="border rounded p-4 bg-white">
            <h2 className="text-lg font-semibold mb-3">Linked Findings</h2>

            <table className="w-full text-sm border">
                <thead className="bg-gray-100">
                <tr>
                    <th className="p-2 text-left">Severity</th>
                    <th className="p-2 text-left">Summary</th>
                    <th className="p-2 text-left">Last Observed</th>
                </tr>
                </thead>
                <tbody>
                {pagedFindings.map(f => (
                    <tr key={f.id} className="border-t">
                        <td className="p-2">{f.severity}</td>
                        <td className="p-2">{f.summary}</td>
                        <td className="p-2">{f.lastObserved}</td>
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
