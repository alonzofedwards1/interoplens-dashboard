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
                label="Change Password"
                description="Update your account password"
            >
                <button className="btn btn-outline btn-sm" disabled>
                    Change Password
                </button>
            </SettingsRow>

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

            <SettingsRow
                label="Multi-Factor Authentication (MFA)"
                description="Add an extra layer of security to your account"
            >
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        className="toggle"
                        disabled
                    />
                    <span className="badge badge-outline text-xs">
                        Coming Soon
                    </span>
                </div>
            </SettingsRow>

        </div>
    );
};

export default SecuritySettings;
