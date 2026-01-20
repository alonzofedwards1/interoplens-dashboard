import React from "react";
import { useUserPreferences } from "../../lib/useUserPreferences";

/* ----------------------------------
   Local SettingsRow (ok to duplicate for now)
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
   Account Settings
----------------------------------- */

const AccountSettings: React.FC = () => {
    const { preferences, setTimezone } = useUserPreferences();
    return (
        <div className="space-y-6">
            <SettingsRow
                label="Timezone"
                description="Used for dashboards, timestamps, and reports"
            >
                <select
                    className="select select-bordered w-64"
                    value={preferences.timezone}
                    onChange={event => setTimezone(event.target.value)}
                >
                    <option value="America/Los_Angeles">
                        (UTC−08:00) Pacific Time
                    </option>
                    <option value="America/Denver">
                        (UTC−07:00) Mountain Time
                    </option>
                    <option value="America/Chicago">
                        (UTC−06:00) Central Time
                    </option>
                    <option value="America/New_York">
                        (UTC−05:00) Eastern Time
                    </option>
                    <option value="UTC">(UTC±00:00) UTC</option>
                </select>
            </SettingsRow>
        </div>
    );
};

export default AccountSettings;
