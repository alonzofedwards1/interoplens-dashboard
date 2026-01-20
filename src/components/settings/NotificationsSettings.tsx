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
   Notifications Settings
----------------------------------- */

const NotificationsSettings: React.FC = () => {
    return (
        <div className="space-y-8">

            {/* Alert Types */}
            <SettingsRow
                label="Error Rate Alerts"
                description="Notify when interoperability error rates exceed defined thresholds"
            >
                <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    defaultChecked
                />
            </SettingsRow>

            <SettingsRow
                label="Sustained Patient Discovery Failures"
                description="Alert when Patient Discovery failures persist over time"
            >
                <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    defaultChecked
                />
            </SettingsRow>

            <SettingsRow
                label="Daily Activity Summary"
                description="Receive a daily summary of interoperability activity"
            >
                <input
                    type="checkbox"
                    className="toggle"
                />
            </SettingsRow>

            {/* Delivery Preferences */}
            <SettingsRow
                label="Notification Delivery Method"
                description="How notifications are delivered to you"
            >
                <select className="select select-bordered w-64">
                    <option>Email</option>
                    <option>In-app</option>
                    <option>Email & In-app</option>
                </select>
            </SettingsRow>
        </div>
    );
};

export default NotificationsSettings;
