import React from "react";
import { useUserPreferences } from "../../lib/useUserPreferences";

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
    const { preferences, setUiPreferences } = useUserPreferences();
    const ui = preferences.ui;
    return (
        <div className="space-y-6">

            <SettingsRow
                label="Theme"
                description="Choose how the application looks"
            >
                <select
                    className="select select-bordered w-64"
                    value={ui.theme}
                    onChange={event =>
                        setUiPreferences({
                            ...ui,
                            theme: event.target.value as "light" | "dark",
                        })
                    }
                >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </SettingsRow>

            <SettingsRow
                label="Layout Density"
                description="Control spacing and information density"
            >
                <select
                    className="select select-bordered w-64"
                    value={ui.density}
                    onChange={event =>
                        setUiPreferences({
                            ...ui,
                            density: event.target.value as
                                | "comfortable"
                                | "compact",
                        })
                    }
                >
                    <option value="comfortable">Comfortable</option>
                    <option value="compact">Compact</option>
                </select>
            </SettingsRow>

        </div>
    );
};

export default AppearanceSettings;
