import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ForgotPasswordPage from "./features/auth/ForgotPasswordPage";
import Dashboard from "./features/dashboard/DashboardPage";
import ViewAllFindings from "./features/findings/ViewAllFindingsPage";
import TelemetryPage from "./features/telemetry/TelemetryPage";
import IntegrationIssuesPage from "./features/integration-issues/IntegrationIssuesPage";
import Reports from "./features/reports/ReportsPage";
import Settings from "./features/settings/SettingsPage";
import PDExecutions from "./features/pd-executions/PDExecutionsPage";
import TransactionDetailPage from "./features/transactions/TransactionDetailPage";
import LoginPage from "./features/auth/LoginPage";

import CommitteeQueue from "./features/committee/CommitteeQueue";
import CommitteeCaseDetail from "./features/committee/CommitteeCaseDetail";
import KnowledgeBasePage from "./features/knowledge-base/KnowledgeBasePage";

import OidQueue from "./features/oid-directory/OidQueue";
import OidDetail from "./features/oid-directory/OidDetail";

import { useAuth } from "./context/AuthContext";
import { ServerDataProvider } from "./lib/ServerDataContext";
import { UserRole } from "./types/auth";

/* ============================
   Helpers (future-ready)
============================ */

const normalizeRole = (role?: string): UserRole | null => {
    if (role === "admin" || role === "analyst" || role === "committee") {
        return role;
    }
    return null;
};

/* ============================
   Routes
============================ */

const AppRoutes: React.FC = () => {
    const { logout } = useAuth();

    const handleLogout = () => {
        void logout();
    };

    /**
     * 🚨 IMPORTANT
     * Backend does NOT return role yet.
     * Role must be null until /me includes it.
     */
    const role: UserRole | null = null;

    return (
        <Routes>
            {/* Redirect root */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Dashboard */}
            <Route
                path="/dashboard"
                element={<Dashboard role={role} onLogout={handleLogout} />}
            />

            {/* Findings */}
            <Route path="/findings" element={<ViewAllFindings />} />

            {/* PD / Telemetry */}
            <Route path="/pd-executions" element={<PDExecutions />} />
            <Route path="/transactions/:id" element={<TransactionDetailPage />} />
            <Route path="/telemetry" element={<TelemetryPage />} />

            {/* Committee */}
            <Route path="/committee" element={<CommitteeQueue />} />
            <Route path="/committee/:id" element={<CommitteeCaseDetail />} />

            {/* Knowledge Base */}
            <Route path="/knowledge-base" element={<KnowledgeBasePage />} />

            {/* OID Directory */}
            <Route path="/oids" element={<OidQueue />} />
            <Route path="/oids/:oid" element={<OidDetail />} />

            {/* Integration Issues */}
            <Route
                path="/integration-issues"
                element={<IntegrationIssuesPage role={role} />}
            />
            <Route
                path="/IntegrationIssues"
                element={<Navigate to="/integration-issues" replace />}
            />

            {/* Reports / Settings */}
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings role={role} />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

/* ============================
   App Wrapper
============================ */

const App: React.FC = () => {
    return (
        <ServerDataProvider>
            <AppRoutes />
        </ServerDataProvider>
    );
};

console.log("API BASE URL:", process.env.REACT_APP_API_BASE_URL);
console.log("TELEMETRY BASE URL:", process.env.REACT_APP_TELEMETRY_BASE_URL);

export default App;
