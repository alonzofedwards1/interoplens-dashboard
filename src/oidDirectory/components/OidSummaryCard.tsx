import { OidDirectoryRecord } from "../data/oidDirectory.data";

interface Props {
    record: OidDirectoryRecord;
}

const OidSummaryCard = ({ record }: Props) => {
    return (
        <div className="border rounded p-4 bg-white">
            <h2 className="text-lg font-semibold mb-2">OID Summary</h2>

            <p><strong>OID:</strong> <span className="font-mono">{record.oid}</span></p>
            <p><strong>Name:</strong> {record.displayName}</p>
            <p><strong>Status:</strong> {record.status}</p>
            <p><strong>Owner:</strong> {record.ownerOrg ?? "Unassigned"}</p>
            <p><strong>Confidence:</strong> {record.confidence}</p>
            <p><strong>Source:</strong> {record.source}</p>
            <p><strong>First Seen:</strong> {record.firstSeen}</p>
            <p><strong>Last Seen:</strong> {record.lastSeen}</p>
        </div>
    );
};

export default OidSummaryCard;
