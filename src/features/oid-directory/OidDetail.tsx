import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchOidDetail, submitOidGovernance } from "../../lib/api/oids";
import { OidDetail as OidDetailRecord } from "../../types";

import OidSummaryCard from "./components/OidSummaryCard";
import ObservationSnapshot from "./components/ObservationSnapshot";
import UsageTimeline from "./components/UsageTimeline";
import GovernancePanel from "./components/GovernancePanel";
import LinkedFindingsTable from "./components/LinkedFindingsTable";

const OidDetail = () => {
    const { oid } = useParams();
    const navigate = useNavigate();
    const decodedOid = decodeURIComponent(oid || "");

    const [record, setRecord] = useState<OidDetailRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const load = async () => {
        try {
            setLoading(true);
            const data = await fetchOidDetail(decodedOid);
            setRecord(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load OID");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (decodedOid) load();
    }, [decodedOid]);

    const handleGovernance = async (
        action: "APPROVE" | "REJECT" | "DEPRECATE" | "REACTIVATE"
    ) => {
        if (!decodedOid) return;
        try {
            setIsSubmitting(true);
            await submitOidGovernance(decodedOid, action);
            await load(); // 🔁 re-fetch authoritative state
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-6">Loading OID…</div>;
    if (!record || error)
        return <div className="p-6 text-red-600">{error}</div>;

    return (
        <div className="p-6 space-y-4">
            <button
                onClick={() => navigate("/oids")}
                className="text-blue-600 text-sm"
            >
                ← Back to OID Directory
            </button>

            <h1 className="text-2xl font-semibold font-mono">{record.oid}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <OidSummaryCard record={record} />
                <ObservationSnapshot record={record} />
                <UsageTimeline record={record} />

                <GovernancePanel
                    record={record}
                    isSubmitting={isSubmitting}
                    onAction={handleGovernance}
                />
            </div>

            <LinkedFindingsTable findings={record.findings ?? []} />
        </div>
    );
};

export default OidDetail;
