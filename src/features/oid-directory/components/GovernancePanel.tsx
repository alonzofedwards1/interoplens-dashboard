import type { OidDetail } from "../../../types";
import { OID_STATUS_ACTIONS } from "../data/oidStatus.data";

/**
 * Derive the valid OID status type directly from the action map.
 * This guarantees frontend + data alignment.
 */
type OidStatus = keyof typeof OID_STATUS_ACTIONS;

interface Props {
    record: OidDetail & {
        status: OidStatus;
    };
}

const GovernancePanel = ({ record }: Props) => {
    const actions = OID_STATUS_ACTIONS[record.status] ?? [];

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
            <h2 className="text-lg font-semibold mb-2">
                Governance Actions
            </h2>

            <div className="flex gap-2 flex-wrap">
                {actions.length > 0 ? (
                    actions.map(renderButton)
                ) : (
                    <span className="text-sm text-gray-500">
                        No actions available for this status
                    </span>
                )}
            </div>
        </div>
    );
};

export default GovernancePanel;
