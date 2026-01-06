import React, { useEffect, useState } from 'react';
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

import {
    AuthSession,
    clearSession,
    persistSession,
    readSession,
    subscribeToSession,
} from './lib/authClient';
import { SessionProvider } from './lib/SessionContext';
import { ServerDataProvider } from './lib/ServerDataContext';
import { isAuthEnabled } from './config/auth';

const App: React.FC = () => {
    const [session, setSession] = useState<AuthSession | null>(null);
    const [authChecked, setAuthChecked] = useState(!isAuthEnabled);

    useEffect(() => {
        if (!isAuthEnabled) return;

        const syncSession = () => {
            setSession(readSession());
            setAuthChecked(true);
        };

        syncSession();
        const unsubscribe = subscribeToSession(syncSession);

        return () => {
            unsubscribe();
        };
    }, []);

    if (!authChecked)
        return (
            <div className="min-h-screen flex items-center justify-center">
                Checking session...
            </div>
        );

    const requireAuth = (el: React.ReactElement) =>
        !isAuthEnabled || session ? el : <Navigate to="/" replace />;

    const loginElement = !isAuthEnabled ? null : (
        <Login
            onLogin={({ user, token }) => {
                const newSession = persistSession(user, token);
                setSession(newSession);
            }}
        />
    );

    return (
        <SessionProvider session={session}>
            <ServerDataProvider>
                <Routes>
                    <Route
                        path="/"
                        element={
                            isAuthEnabled
                                ? session
                                    ? <Navigate to="/dashboard" replace />
                                    : loginElement
                                : <Navigate to="/dashboard" replace />
                        }
                    />
                    {isAuthEnabled && <Route path="/login" element={loginElement} />}
                    {isAuthEnabled && (
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    )}

                    <Route
                        path="/dashboard"
                        element={requireAuth(
                            <Dashboard
                                role={session?.role ?? null}
                                onLogout={() => {
                                    clearSession();
                                    setSession(null);
                                }}
                            />
                        )}
                    />

                    <Route path="/findings" element={requireAuth(<ViewAllFindings />)} />
                    <Route path="/telemetry" element={requireAuth(<TelemetryPage />)} />

                    {/* Committee */}
                    <Route path="/committee" element={requireAuth(<CommitteeQueue />)} />
                    <Route
                        path="/committee/:id"
                        element={requireAuth(<CommitteeCaseDetail />)}
                    />

                    <Route
                        path="/knowledge-base"
                        element={requireAuth(<KnowledgeBasePage />)}
                    />

                    {/* OID Directory */}
                    <Route path="/oids" element={requireAuth(<OidQueue />)} />
                    <Route
                        path="/oids/:oid"
                        element={requireAuth(<OidDetail />)}
                    />

                    <Route
                        path="/integration-issues"
                        element={requireAuth(
                            <IntegrationIssuesPage role={session?.role ?? null} />
                        )}
                    />
                    <Route
                        path="/IntegrationIssues"
                        element={<Navigate to="/integration-issues" replace />}
                    />

                    <Route path="/reports" element={requireAuth(<Reports />)} />
                    <Route
                        path="/settings"
                        element={requireAuth(<Settings role={session?.role ?? null} />)}
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </ServerDataProvider>
        </SessionProvider>
    );
};

export default App;
