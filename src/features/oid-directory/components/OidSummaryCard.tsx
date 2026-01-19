import type { OidDetail } from "../../../types";
import { OID_STATUS_LABELS } from "../data/oidStatus.data";

interface Props {
    record: OidDetail;
}

const OidSummaryCard = ({ record }: Props) => {
    return (
        <div className="border rounded p-4 bg-white">
            <h2 className="text-lg font-semibold mb-2">OID Summary</h2>

            <p><strong>OID:</strong> <span className="font-mono">{record.oid}</span></p>
            <p><strong>Name:</strong> {record.displayName}</p>
            <p><strong>Status:</strong> {OID_STATUS_LABELS[record.status]}</p>
            <p><strong>Owner:</strong> {record.ownerOrg ?? "Unassigned"}</p>
            <p><strong>Confidence:</strong> {record.confidence}</p>
            <p><strong>First Seen:</strong> {record.firstSeen}</p>
            <p><strong>Last Seen:</strong> {record.lastSeen}</p>
        </div>
    );
};

export default OidSummaryCard;
