import { OidDirectoryRecord } from "../data/oidDirectory.data";

interface Props {
    record: OidDirectoryRecord;
}

const ResolutionPanel = ({ record }: Props) => {
    return (
        <div className="border rounded p-4 bg-white">
            <h2 className="text-lg font-semibold mb-2">Resolution</h2>

            <p className="text-sm text-gray-700">
                Current status: <strong>{record.status}</strong>
            </p>

            <p className="text-sm text-gray-600 mt-2">
                {record.notes ??
                    "No resolution notes have been recorded for this OID."}
            </p>
        </div>
    );
};

export default ResolutionPanel;
