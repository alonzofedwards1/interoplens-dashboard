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
   Dashboard Preferences Settings
----------------------------------- */

const DashboardPreferencesSettings: React.FC = () => {
    return (
        <div className="space-y-6">

            <SettingsRow
                label="Default Landing View"
                description="Select the initial dashboard view after login"
            >
                <select className="select select-bordered w-64">
                    <option>Summary</option>
                    <option>Patient Discovery Outcomes</option>
                    <option>Findings Table</option>
                </select>
            </SettingsRow>

            <SettingsRow
                label="Default Date Range"
                description="Time range applied when the dashboard loads"
            >
                <select className="select select-bordered w-64">
                    <option>Last 24 hours</option>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                </select>
            </SettingsRow>

            <SettingsRow
                label="Time Grouping"
                description="How data is grouped in charts"
            >
                <select className="select select-bordered w-64">
                    <option>Hourly</option>
                    <option>Daily</option>
                </select>
            </SettingsRow>

            <SettingsRow
                label="Persist Filters"
                description="Retain selected filters between sessions"
            >
                <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    defaultChecked
                />
            </SettingsRow>

            <SettingsRow
                label="Auto-refresh Dashboard"
                description="Periodically refresh dashboard data"
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

export default DashboardPreferencesSettings;
