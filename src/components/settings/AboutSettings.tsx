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
    <div className="flex items-center justify-between gap-8">
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
   Audit & Compliance Settings
----------------------------------- */

const AuditComplianceSettings: React.FC = () => {
    return (
        <div className="space-y-6">

            <SettingsRow
                label="Audit Logging"
                description="Track configuration changes and system events"
            >
                <span className="badge badge-success badge-outline">
                    Enabled
                </span>
            </SettingsRow>

            <SettingsRow
                label="Data Retention"
                description="Duration audit records are retained"
            >
                <span className="text-sm text-base-content/80">
                    90 days
                </span>
            </SettingsRow>

            <SettingsRow
                label="Compliance Mode"
                description="Operational compliance alignment"
            >
                <span className="badge badge-success badge-outline">
                    TEFCA-Aligned
                </span>
            </SettingsRow>

            <SettingsRow
                label="Last Configuration Change"
                description="Most recent settings update"
            >
                <span className="text-sm text-base-content/70">
                    Sep 18, 2025 · 3:14 PM
                </span>
            </SettingsRow>

            <SettingsRow
                label="Audit Log"
                description="Review historical configuration and access events"
            >
                <div className="flex items-center gap-3">
                    <button className="btn btn-outline btn-sm" disabled>
                        View Audit Log
                    </button>
                    <span className="badge badge-outline text-xs">
                        Restricted
                    </span>
                </div>
            </SettingsRow>

        </div>
    );
};

export default AuditComplianceSettings;
