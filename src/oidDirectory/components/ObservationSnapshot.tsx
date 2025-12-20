import { OidDirectoryRecord } from "../data/oidDirectory.data";

interface Props {
    record: OidDirectoryRecord;
}

const ObservationSnapshot = ({ record }: Props) => {
    return (
        <div className="border rounded p-4 bg-white">
            <h2 className="text-lg font-semibold mb-2">Observation Snapshot</h2>

            <ul className="list-disc ml-6">
                <li>Observed via interoperability metadata</li>
                <li>Routing headers & assigning authority fields</li>
                <li>No payload inspection</li>
            </ul>

            <div className="mt-3 text-sm text-gray-600">
                <p>PD Transactions: {record.usage.pd}</p>
                <p>QD Transactions: {record.usage.qd}</p>
                <p>RD Transactions: {record.usage.rd}</p>
                <p>XDS Transactions: {record.usage.xds}</p>
            </div>
        </div>
    );
};

export default ObservationSnapshot;
