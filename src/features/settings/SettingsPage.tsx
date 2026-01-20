import React from "react";
import {
    FaUser,
    FaShieldAlt,
    FaChartBar,
    FaPlug,
    FaPaintBrush,
    FaArrowLeft
} from "react-icons/fa";
import { Link } from "react-router-dom";

/* ---- Section Components ---- */
import AccountSettings from "../../components/settings/AccountSettings";
import SecuritySettings from "../../components/settings/SecuritySettings";
import DashboardPreferencesSettings from "../../components/settings/DashboardPreferencesSettings";
import InteroperabilitySettings from "../../components/settings/InteroperabilitySettings";
import AppearanceSettings from "../../components/settings/AppearanceSettings";
import UserManagementSettings from "../../components/settings/UserManagementSettings";

/* ----------------------------------
   Section Config
----------------------------------- */

const sections = [
    { id: "account", label: "Account", icon: <FaUser /> },
    { id: "security", label: "Security", icon: <FaShieldAlt /> },
    { id: "users", label: "User Management", icon: <FaUser /> },
    { id: "dashboard", label: "Dashboard Preferences", icon: <FaChartBar /> },
    { id: "interop", label: "Interoperability Configuration", icon: <FaPlug /> },
    { id: "appearance", label: "Appearance", icon: <FaPaintBrush /> }
];

/* ----------------------------------
   Settings Section Wrapper
----------------------------------- */

type SettingsSectionProps = {
    id: string;
    title: string;
    description?: string;
    children: React.ReactNode;
};

const SettingsSection = ({
                             id,
                             title,
                             description,
                             children
                         }: SettingsSectionProps) => (
    <section id={id} className="scroll-mt-32">
        <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body space-y-6">
                <div>
                    <h2 className="text-xl font-semibold">{title}</h2>
                    {description && (
                        <p className="text-sm text-base-content/70">
                            {description}
                        </p>
                    )}
                </div>
                {children}
            </div>
        </div>
    </section>
);

/* ----------------------------------
   Page
----------------------------------- */

const SettingsPage: React.FC = () => {
    return (
        <div className="p-8 bg-base-200 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-2"
                >
                    <FaArrowLeft />
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-semibold">Settings</h1>
            </div>

            <div className="flex gap-10">
                {/* Left Nav */}
                <aside className="w-64 shrink-0">
                    <div className="sticky top-28">
                        <ul className="menu bg-base-100 rounded-xl shadow border border-base-300">
                            {sections.map(section => (
                                <li key={section.id}>
                                    <a
                                        href={`#${section.id}`}
                                        className="flex items-center gap-3 text-sm font-medium"
                                    >
                                        {section.icon}
                                        {section.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Content */}
                <div className="flex-1 space-y-14">
                    <SettingsSection
                        id="account"
                        title="Account"
                        description="User profile and regional preferences"
                    >
                        <AccountSettings />
                    </SettingsSection>

                    <SettingsSection
                        id="security"
                        title="Security"
                        description="Authentication, sessions, and access controls"
                    >
                        <SecuritySettings />
                    </SettingsSection>

                    <SettingsSection
                        id="users"
                        title="User Management"
                        description="Role counts and active directory"
                    >
                        <UserManagementSettings />
                    </SettingsSection>

                    <SettingsSection
                        id="dashboard"
                        title="Dashboard Preferences"
                        description="Default views, date ranges, and data grouping"
                    >
                        <DashboardPreferencesSettings />
                    </SettingsSection>

                    <SettingsSection
                        id="interop"
                        title="Interoperability Configuration"
                        description="Phase 0 interoperability behavior"
                    >
                        <InteroperabilitySettings />
                    </SettingsSection>

                    <SettingsSection
                        id="appearance"
                        title="Appearance"
                        description="Theme, density, and user interface options"
                    >
                        <AppearanceSettings />
                    </SettingsSection>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
