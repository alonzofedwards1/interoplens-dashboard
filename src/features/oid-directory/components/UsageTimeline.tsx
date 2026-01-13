import type { OidDetail } from "../../../types";

interface Props {
    record: OidDetail;
}

const UsageTimeline = ({ record }: Props) => {
    return (
        <div className="border rounded p-4 bg-white">
            <h2 className="text-lg font-semibold mb-2">Usage Timeline</h2>

            <div className="text-sm text-gray-700 space-y-1">
                <p>First observed: {record.firstSeen}</p>
                <p>Most recent activity: {record.lastSeen}</p>
                <p>Total observed activity:</p>
                <ul className="list-disc ml-6">
                    <li>PD: {record.usage?.pd ?? '—'}</li>
                    <li>QD: {record.usage?.qd ?? '—'}</li>
                    <li>RD: {record.usage?.rd ?? '—'}</li>
                    <li>XDS: {record.usage?.xds ?? '—'}</li>
                </ul>
            </div>
        </div>
    );
};

export default UsageTimeline;
