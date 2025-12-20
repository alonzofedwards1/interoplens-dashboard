import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { oidQueueData } from "./data/oidQueue.data";
import { OidStatus } from "./data/oidStatus.data";

const OidQueue = () => {
    const navigate = useNavigate();

    const [statusFilter, setStatusFilter] = useState<OidStatus | "ALL">("ALL");
    const [confidenceFilter, setConfidenceFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");

    const filtered = oidQueueData.filter(item => {
        if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
        if (confidenceFilter !== "ALL" && item.confidence !== confidenceFilter) return false;
        return true;
    });

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">OID Directory</h1>

            {/* Filters */}
            <div className="flex gap-4 mb-4">
                <select
                    className="border p-2 rounded"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as any)}
                >
                    <option value="ALL">All Statuses</option>
                    <option value="UNKNOWN">Unknown</option>
                    <option value="ACTIVE">Active</option>
                    <option value="DEPRECATED">Deprecated</option>
                    <option value="PENDING">Pending</option>
                </select>

                <select
                    className="border p-2 rounded"
                    value={confidenceFilter}
                    onChange={e => setConfidenceFilter(e.target.value as any)}
                >
                    <option value="ALL">All Confidence</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 text-left">OID</th>
                        <th className="p-2 text-left">Display Name</th>
                        <th className="p-2 text-left">Owner</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left">Confidence</th>
                        <th className="p-2 text-left">Last Seen</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.map(oid => (
                        <tr
                            key={oid.oid}
                            className="border-t cursor-pointer hover:bg-gray-50"
                            onClick={() => navigate(`/oids/${encodeURIComponent(oid.oid)}`)}
                        >
                            <td className="p-2 font-mono">{oid.oid}</td>
                            <td className="p-2">{oid.displayName}</td>
                            <td className="p-2">{oid.ownerOrg ?? "Unassigned"}</td>
                            <td className="p-2">{oid.status}</td>
                            <td className="p-2">{oid.confidence}</td>
                            <td className="p-2">{oid.lastSeen}</td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-4 text-center text-gray-500">
                                No OIDs match the selected filters
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OidQueue;
