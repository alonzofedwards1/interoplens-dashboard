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
   Dashboard Preferences Settings
----------------------------------- */

const DashboardPreferencesSettings: React.FC = () => {
    const { preferences, setDashboardPreferences } = useUserPreferences();
    const dashboard = preferences.dashboard;
    return (
        <div className="space-y-6">

            <SettingsRow
                label="Default Landing View"
                description="Select the initial dashboard view after login"
            >
                <select
                    className="select select-bordered w-64"
                    value={dashboard.defaultLandingView}
                    onChange={event =>
                        setDashboardPreferences({
                            ...dashboard,
                            defaultLandingView: event.target.value as
                                | "dashboard"
                                | "pd-executions"
                                | "findings",
                        })
                    }
                >
                    <option value="dashboard">Summary</option>
                    <option value="pd-executions">Patient Discovery Outcomes</option>
                    <option value="findings">Findings Table</option>
                </select>
            </SettingsRow>

            <SettingsRow
                label="Default Date Range"
                description="Time range applied when the dashboard loads"
            >
                <select
                    className="select select-bordered w-64"
                    value={dashboard.defaultDateRange}
                    onChange={event =>
                        setDashboardPreferences({
                            ...dashboard,
                            defaultDateRange: event.target.value as
                                | "24h"
                                | "7d"
                                | "30d",
                        })
                    }
                >
                    <option value="24h">Last 24 hours</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                </select>
            </SettingsRow>

            <SettingsRow
                label="Time Grouping"
                description="How data is grouped in charts"
            >
                <select
                    className="select select-bordered w-64"
                    value={dashboard.timeGrouping}
                    onChange={event =>
                        setDashboardPreferences({
                            ...dashboard,
                            timeGrouping: event.target.value as
                                | "hourly"
                                | "daily",
                        })
                    }
                >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                </select>
            </SettingsRow>

            <SettingsRow
                label="Persist Filters"
                description="Retain selected filters between sessions"
            >
                <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={dashboard.persistFilters}
                    onChange={event =>
                        setDashboardPreferences({
                            ...dashboard,
                            persistFilters: event.target.checked,
                        })
                    }
                />
            </SettingsRow>
        </div>
    );
};

export default DashboardPreferencesSettings;
