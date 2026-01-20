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
                <span
                    className="text-sm text-base-content/80"
                    title="Session timeout is enforced globally"
                >
                    15 minutes
                </span>
            </SettingsRow>
        </div>
    );
};

export default SecuritySettings;
