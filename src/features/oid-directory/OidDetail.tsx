import { useParams, useNavigate } from "react-router-dom";
import { oidDirectoryData } from "./data/oidDirectory.data";

const OidDetail = () => {
    const { oid } = useParams();
    const navigate = useNavigate();

    const decodedOid = decodeURIComponent(oid || "");
    const record = oidDirectoryData.find(o => o.oid === decodedOid);

    if (!record) {
        return (
            <div className="p-6">
                <button
                    className="text-blue-600 mb-4"
                    onClick={() => navigate("/oids")}
                >
                    ← Back to OID Directory
                </button>
                <p className="text-red-600">OID not found.</p>
            </div>
        );
    }

    const renderActions = () => {
        switch (record.status) {
            case "UNKNOWN":
                return (
                    <>
                        <button className="btn-primary">Assign Organization</button>
                        <button className="btn-secondary">Map as Alias</button>
                        <button className="btn-outline">Ignore</button>
                    </>
                );
            case "ACTIVE":
                return (
                    <>
                        <button className="btn-primary">Add Alias</button>
                        <button className="btn-warning">Deprecate</button>
                    </>
                );
            case "DEPRECATED":
                return (
                    <>
                        <button className="btn-primary">Reactivate</button>
                        <button className="btn-outline">Mark Migration Complete</button>
                    </>
                );
            case "PENDING":
                return (
                    <>
                        <button className="btn-success">Approve</button>
                        <button className="btn-danger">Reject</button>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-6">
            <button
                className="text-blue-600 mb-4"
                onClick={() => navigate("/oids")}
            >
                ← Back to OID Directory
            </button>

            <h1 className="text-2xl font-semibold mb-2 font-mono">{record.oid}</h1>

            {/* Summary */}
            <div className="border rounded p-4 mb-4">
                <p><strong>Name:</strong> {record.displayName}</p>
                <p><strong>Status:</strong> {record.status}</p>
                <p><strong>Owner:</strong> {record.ownerOrg ?? "Unassigned"}</p>
                <p><strong>Confidence:</strong> {record.confidence}</p>
                <p><strong>First Seen:</strong> {record.firstSeen}</p>
                <p><strong>Last Seen:</strong> {record.lastSeen}</p>
            </div>

            {/* Observation Snapshot */}
            <div className="border rounded p-4 mb-4">
                <h2 className="font-semibold mb-2">Observed Usage</h2>
                <ul className="list-disc ml-6">
                    <li>PD Transactions: {record.usage.pd}</li>
                    <li>QD Transactions: {record.usage.qd}</li>
                    <li>RD Transactions: {record.usage.rd}</li>
                    <li>XDS Transactions: {record.usage.xds}</li>
                </ul>
            </div>

            {/* Actions */}
            <div className="border rounded p-4">
                <h2 className="font-semibold mb-2">Governance Actions</h2>
                <div className="flex gap-2 flex-wrap">
                    {renderActions()}
                </div>
            </div>
        </div>
    );
};

export default OidDetail;
