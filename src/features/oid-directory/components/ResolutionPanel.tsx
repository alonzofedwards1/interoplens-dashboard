import type { OidDetail } from "../../../types";

interface Props {
    record: OidDetail;
}

const ResolutionPanel = ({ record }: Props) => {
    return (
        <div className="border rounded p-4 bg-white">
            <h2 className="text-lg font-semibold mb-2">Resolution</h2>

            <p className="text-sm text-gray-700">
                Current status: <strong>{record.status}</strong>
            </p>

            <p className="text-sm text-gray-600 mt-2">
                Resolution notes are managed by governance workflows.
            </p>
        </div>
    );
};

export default ResolutionPanel;
