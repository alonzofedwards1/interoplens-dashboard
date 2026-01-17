import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './features/dashboard/DashboardPage';
import ViewAllFindings from './features/findings/ViewAllFindingsPage';
import TelemetryPage from './features/telemetry/TelemetryPage';
import IntegrationIssuesPage from './features/integration-issues/IntegrationIssuesPage';
import Reports from './features/reports/ReportsPage';
import Settings from './features/settings/SettingsPage';
import PDExecutions from './features/pd-executions/PDExecutionsPage';
import TransactionDetailPage from './features/transactions/TransactionDetailPage';

import CommitteeQueue from './features/committee/CommitteeQueue';
import CommitteeCaseDetail from './features/committee/CommitteeCaseDetail';
import KnowledgeBasePage from './features/knowledge-base/KnowledgeBasePage';

import OidQueue from './features/oid-directory/OidQueue';
import OidDetail from './features/oid-directory/OidDetail';

import { useAuth } from './context/AuthContext';
import { ServerDataProvider } from './lib/ServerDataContext';

const AppRoutes: React.FC = () => {
    const { logout } = useAuth();
    const handleLogout = () => {
        void logout();
    };

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            <Route
                path="/dashboard"
                element={<Dashboard role={null} onLogout={handleLogout} />}
            />

            <Route path="/findings" element={<ViewAllFindings />} />
            <Route
                path="/pd-executions"
                element={<PDExecutions />}
            />
            <Route
                path="/transactions/:id"
                element={<TransactionDetailPage />}
            />
            <Route path="/telemetry" element={<TelemetryPage />} />

            {/* Committee */}
            <Route path="/committee" element={<CommitteeQueue />} />
            <Route
                path="/committee/:id"
                element={<CommitteeCaseDetail />}
            />

            <Route path="/knowledge-base" element={<KnowledgeBasePage />} />

            {/* OID Directory */}
            <Route path="/oids" element={<OidQueue />} />
            <Route path="/oids/:oid" element={<OidDetail />} />

            <Route
                path="/integration-issues"
                element={<IntegrationIssuesPage role={null} />}
            />
            <Route path="/IntegrationIssues" element={<Navigate to="/integration-issues" replace />} />

            <Route path="/reports" element={<Reports />} />
            <Route
                path="/settings"
                element={<Settings role={null} />}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

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
