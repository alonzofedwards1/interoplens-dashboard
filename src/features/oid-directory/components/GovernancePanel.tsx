import { OidDirectoryRecord } from "../data/oidDirectory.data";
import { OID_STATUS_ACTIONS } from "../data/oidStatus.data";

interface Props {
    record: OidDirectoryRecord;
}

const GovernancePanel = ({ record }: Props) => {
    const actions = OID_STATUS_ACTIONS[record.status];

    const renderButton = (action: string) => (
        <button
            key={action}
            className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200 text-sm"
        >
            {action.replace(/_/g, " ")}
        </button>
    );

    return (
        <div className="border rounded p-4 bg-white">
            <h2 className="text-lg font-semibold mb-2">Governance Actions</h2>

            <div className="flex gap-2 flex-wrap">
                {actions.map(renderButton)}
            </div>
        </div>
    );
};

export default GovernancePanel;
