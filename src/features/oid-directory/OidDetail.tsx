import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { fetchOidDetail, submitOidGovernance } from "../../lib/api/oids";
import type { OidDetail as OidDetailRecord, OidGovernanceAction } from "../../types";
import { normalizeOidDetail } from "./utils/normalizeOid";

import OidSummaryCard from "./components/OidSummaryCard";
import ObservationSnapshot from "./components/ObservationSnapshot";
import UsageTimeline from "./components/UsageTimeline";
import GovernancePanel from "./components/GovernancePanel";
import LinkedFindingsTable from "./components/LinkedFindingsTable";

const OidDetail = () => {
    const { oid } = useParams();
    const navigate = useNavigate();
    const decodedOid = useMemo(() => {
        if (!oid) return "";
        try {
            return decodeURIComponent(oid);
        } catch {
            return oid;
        }
    }, [oid]);

    const [record, setRecord] = useState<OidDetailRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const inFlightRef = useRef(false);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchOidDetail(decodedOid);
            if (!data) {
                setRecord(null);
                setError("No OID data returned.");
                return;
            }
            // Normalize to guard against missing fields or unknown status values.
            setRecord(normalizeOidDetail(data, decodedOid));
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load OID");
        } finally {
            setLoading(false);
        }
    }, [decodedOid]);

    useEffect(() => {
        if (decodedOid) {
            load();
        }
    }, [decodedOid, load]);

    const handleGovernance = async (action: OidGovernanceAction) => {
        if (!record || isSubmitting || inFlightRef.current) return;

        try {
            inFlightRef.current = true;
            setIsSubmitting(true);
            setActionError(null);
            await submitOidGovernance(record.oid, action);

            // ✅ Re-fetch after successful transition
            await load();
        } catch (err) {
            const responseDetail =
                typeof err === "object" && err && "response" in err
                    ? (err as { response?: { data?: { detail?: string } } }).response
                          ?.data?.detail
                    : undefined;
            setActionError(
                responseDetail ??
                (err instanceof Error ? err.message : "Invalid governance transition")
            );
        } finally {
            setIsSubmitting(false);
            inFlightRef.current = false;
        }
    };

    if (loading) {
        return <div className="p-6">Loading OID…</div>;
    }

    if (!decodedOid) {
        return (
            <div className="p-6 text-sm text-gray-600">
                No OID was provided.
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 space-y-3">
                <button
                    onClick={() => navigate("/oids")}
                    className="text-sm text-blue-600 hover:underline"
                >
                    ← Back to OID Directory
                </button>
                <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    if (!record) {
        return (
            <div className="p-6 text-sm text-gray-600">
                No OID record available.
            </div>
        );
    }

    return (
        <div className="p-6 space-y-4">
            <button
                onClick={() => navigate("/oids")}
                className="text-sm text-blue-600 hover:underline"
            >
                ← Back to OID Directory
            </button>

            <h1 className="text-2xl font-semibold font-mono">{record.oid}</h1>

            {actionError && (
                <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {actionError}
                </div>
            )}

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
