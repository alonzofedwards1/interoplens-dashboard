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
   Appearance Settings
----------------------------------- */

const AppearanceSettings: React.FC = () => {
    return (
        <div className="space-y-6">

            <SettingsRow
                label="Theme"
                description="Choose how the application looks"
            >
                <select className="select select-bordered w-64">
                    <option>Light</option>
                    <option>Dark</option>
                    <option>System</option>
                </select>
            </SettingsRow>

            <SettingsRow
                label="Layout Density"
                description="Control spacing and information density"
            >
                <select className="select select-bordered w-64">
                    <option>Comfortable</option>
                    <option>Compact</option>
                </select>
            </SettingsRow>

            <SettingsRow
                label="Show Tooltips"
                description="Display contextual help throughout the interface"
            >
                <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    defaultChecked
                />
            </SettingsRow>

            <SettingsRow
                label="Animations"
                description="Enable subtle UI animations and transitions"
            >
                <input
                    type="checkbox"
                    className="toggle"
                />
            </SettingsRow>

        </div>
    );
};

export default AppearanceSettings;
