import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './features/auth/LoginPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import Dashboard from './features/dashboard/DashboardPage';
import ViewAllFindings from './features/findings/ViewAllFindingsPage';
import TelemetryPage from './features/telemetry/TelemetryPage';
import IntegrationIssuesPage from './features/integration-issues/IntegrationIssuesPage';
import Reports from './features/reports/ReportsPage';
import Settings from './features/settings/SettingsPage';

import CommitteeQueue from './features/committee/CommitteeQueue';
import CommitteeCaseDetail from './features/committee/CommitteeCaseDetail';
import KnowledgeBasePage from './features/knowledge-base/KnowledgeBasePage';

import OidQueue from './features/oid-directory/OidQueue';
import OidDetail from './features/oid-directory/OidDetail';

import { AuthProvider, useAuth } from './lib/AuthContext';
import { ServerDataProvider } from './lib/ServerDataContext';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

const AppRoutes: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <Routes>
            <Route
                path="/"
                element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard role={user?.role ?? null} onLogout={logout} />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/findings"
                element={<ProtectedRoute>{<ViewAllFindings />}</ProtectedRoute>}
            />
            <Route
                path="/telemetry"
                element={<ProtectedRoute>{<TelemetryPage />}</ProtectedRoute>}
            />

            {/* Committee */}
            <Route
                path="/committee"
                element={<ProtectedRoute>{<CommitteeQueue />}</ProtectedRoute>}
            />
            <Route
                path="/committee/:id"
                element={<ProtectedRoute>{<CommitteeCaseDetail />}</ProtectedRoute>}
            />

            <Route
                path="/knowledge-base"
                element={<ProtectedRoute>{<KnowledgeBasePage />}</ProtectedRoute>}
            />

            {/* OID Directory */}
            <Route path="/oids" element={<ProtectedRoute>{<OidQueue />}</ProtectedRoute>} />
            <Route
                path="/oids/:oid"
                element={<ProtectedRoute>{<OidDetail />}</ProtectedRoute>}
            />

            <Route
                path="/integration-issues"
                element={
                    <ProtectedRoute>
                        <IntegrationIssuesPage role={user?.role ?? null} />
                    </ProtectedRoute>
                }
            />
            <Route path="/IntegrationIssues" element={<Navigate to="/integration-issues" replace />} />

            <Route path="/reports" element={<ProtectedRoute>{<Reports />}</ProtectedRoute>} />
            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <Settings role={user?.role ?? null} />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ServerDataProvider>
                <AppRoutes />
            </ServerDataProvider>
        </AuthProvider>
    );
};

export default App;
