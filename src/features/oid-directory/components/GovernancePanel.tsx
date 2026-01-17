import type { OidDetail } from "../../../types/oids";
import { OID_STATUS_ACTIONS, type OidStatus } from "../data/oidStatus.data";

interface Props {
    record: OidDetail;
}

const GovernancePanel = ({ record }: Props) => {
    const status = record.status.toLowerCase() as OidStatus;
    const actions = status in OID_STATUS_ACTIONS ? OID_STATUS_ACTIONS[status] : [];

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
