import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchOidDetail, OidDetail as OidDetailRecord, submitOidGovernance } from "../../lib/api/oids";

const OidDetail = () => {
    const { oid } = useParams();
    const navigate = useNavigate();

    const decodedOid = decodeURIComponent(oid || "");
    const [record, setRecord] = useState<OidDetailRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const loadOidDetail = async () => {
            if (!decodedOid) return;
            try {
                const data = await fetchOidDetail(decodedOid);
                if (isMounted) {
                    setRecord(data);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Failed to load OID detail");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadOidDetail();
        return () => {
            isMounted = false;
        };
    }, [decodedOid]);

    const handleGovernanceAction = async (action: string) => {
        if (!decodedOid) return;
        setIsSubmitting(true);
        setActionError(null);
        try {
            await submitOidGovernance(decodedOid, action);
            const data = await fetchOidDetail(decodedOid);
            setRecord(data);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Governance action failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderActions = (currentRecord: OidDetailRecord) => {
        switch (currentRecord.status) {
            case "provisional":
                return (
                    <>
                        <button
                            className="btn-success"
                            onClick={() => handleGovernanceAction("APPROVE")}
                            disabled={isSubmitting}
                        >
                            Approve
                        </button>
                        <button
                            className="btn-danger"
                            onClick={() => handleGovernanceAction("REJECT")}
                            disabled={isSubmitting}
                        >
                            Reject
                        </button>
                    </>
                );
            case "approved":
                return (
                    <button
                        className="btn-warning"
                        onClick={() => handleGovernanceAction("DEPRECATE")}
                        disabled={isSubmitting}
                    >
                        Deprecate
                    </button>
                );
            case "deprecated":
                return (
                    <button
                        className="btn-primary"
                        onClick={() => handleGovernanceAction("REACTIVATE")}
                        disabled={isSubmitting}
                    >
                        Reactivate
                    </button>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <button
                    className="text-blue-600 mb-4"
                    onClick={() => navigate("/oids")}
                >
                    ← Back to OID Directory
                </button>
                <div className="rounded border border-dashed p-6 text-center text-gray-500">
                    Loading OID detail...
                </div>
            </div>
        );
    }

    if (!record || error) {
        return (
            <div className="p-6">
                <button
                    className="text-blue-600 mb-4"
                    onClick={() => navigate("/oids")}
                >
                    ← Back to OID Directory
                </button>
                <p className="text-red-600">{error ?? "OID not found."}</p>
            </div>
        );
    }

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
                <p><strong>Owner:</strong> {record.ownerOrg}</p>
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
                {actionError && (
                    <div className="mb-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                        {actionError}
                    </div>
                )}
                <div className="flex gap-2 flex-wrap">
                    {renderActions(record)}
                </div>
            </div>
        </div>
    );
};

export default OidDetail;
