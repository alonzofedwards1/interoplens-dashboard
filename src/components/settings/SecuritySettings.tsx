import React from "react";

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

const SecuritySettings: React.FC = () => {
    return (
        <div className="space-y-6">
            <SettingsRow
                label="Session Timeout"
                description="Automatically log out after inactivity"
            >
                <select className="select select-bordered w-64">
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>4 hours</option>
                </select>
            </SettingsRow>

            <SettingsRow
                label="Re-authentication"
                description="Require password re-entry for sensitive actions"
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

export default SecuritySettings;
