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

    // ✅ readonly-safe
    const actions = OID_STATUS_ACTIONS[status] ?? [];

    return (
        <div className="border rounded p-4 bg-white">
            <h2 className="text-lg font-semibold mb-2">Governance</h2>

            {actions.length === 0 ? (
                <div className="text-sm text-gray-500">
                    No governance actions available for this status.
                </div>
            ) : (
                <div className="flex gap-2 flex-wrap">
                    {actions.map((actionConfig) => (
                        <button
                            key={actionConfig.action}
                            disabled={isSubmitting}
                            onClick={() => onAction(actionConfig.action)}
                            className="px-3 py-1 border rounded text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                        >
                            {actionConfig.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GovernancePanel;
