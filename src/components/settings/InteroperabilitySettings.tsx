import React from "react";

/* ----------------------------------
   Local SettingsRow
----------------------------------- */

 type SettingsRowProps = {
    label: string;
    description?: string;
    children: React.ReactNode;
};

const SettingsRow = ({ label, description, children }: SettingsRowProps) => (
    <div className="flex items-start justify-between gap-8">
        <div>
            <p className="font-medium">{label}</p>
            {description && (
                <p className="text-sm text-base-content/60">
                    {description}
                </p>
            )}
        </div>
        {children}
    </div>
);

/* ----------------------------------
   Interoperability Settings
----------------------------------- */

const InteroperabilitySettings: React.FC = () => {
    return (
        <div className="space-y-8">

            {/* QHIN Selection */}
            <SettingsRow
                label="Active QHINs"
                description="Select which Qualified Health Information Networks to include"
            >
                <div className="space-y-3">
                    <label className="flex items-center gap-3">
                        <input type="checkbox" className="checkbox checkbox-primary" defaultChecked />
                        <span>eHealth Exchange</span>
                    </label>
                    <label className="flex items-center gap-3">
                        <input type="checkbox" className="checkbox checkbox-primary" defaultChecked />
                        <span>Carequality</span>
                    </label>
                    <label className="flex items-center gap-3">
                        <input type="checkbox" className="checkbox checkbox-primary" />
                        <span>CommonWell</span>
                    </label>
                </div>
            </SettingsRow>

            {/* Transaction Types */}
            <SettingsRow
                label="Transaction Types"
                description="Include or exclude specific interoperability transactions"
            >
                <div className="space-y-3">
                    <label className="flex items-center gap-3">
                        <input type="checkbox" className="checkbox checkbox-primary" defaultChecked />
                        <span>Patient Discovery (PD)</span>
                    </label>
                    <label className="flex items-center gap-3">
                        <input type="checkbox" className="checkbox checkbox-primary" defaultChecked />
                        <span>Query for Documents (QD)</span>
                    </label>
                    <label className="flex items-center gap-3">
                        <input type="checkbox" className="checkbox checkbox-primary" defaultChecked />
                        <span>Retrieve Documents (RD)</span>
                    </label>
                </div>
            </SettingsRow>

            {/* Outcome Normalization */}
            <SettingsRow
                label="Outcome Normalization"
                description="Normalize transaction outcomes across networks"
            >
                <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    defaultChecked
                />
            </SettingsRow>

            {/* Retry Handling */}
            <SettingsRow
                label="Retry Aggregation"
                description="Group retries as a single logical transaction"
            >
                <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    defaultChecked
                />
            </SettingsRow>
        </div>
    );
};

export default InteroperabilitySettings;
