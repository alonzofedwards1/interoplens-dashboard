import type {
    OidDetail,
    OidStatus,
    OidGovernanceAction,
} from "../../../types";
import { OID_STATUS_ACTIONS } from "../data/oidStatus.data";

interface Props {
    record: OidDetail;
    onAction: (action: OidGovernanceAction) => void;
    isSubmitting?: boolean;
}

const GovernancePanel = ({ record, onAction, isSubmitting }: Props) => {
    const status: OidStatus = record.status;
    const actions = OID_STATUS_ACTIONS[status];

    return (
        <div className="border rounded p-4 bg-white">
            <h2 className="text-lg font-semibold mb-2">Governance</h2>

            <div className="flex gap-2 flex-wrap">
                {actions.map((action) => (
                    <button
                        key={action}
                        disabled={isSubmitting}
                        onClick={() => onAction(action)}
                        className="px-3 py-1 border rounded text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                    >
                        {action.replace(/_/g, " ")}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GovernancePanel;
