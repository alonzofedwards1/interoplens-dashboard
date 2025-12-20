import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './features/auth/LoginPage';
import Dashboard from './features/dashboard/DashboardPage';
import ViewAllFindings from './features/findings/ViewAllFindingsPage';
import PDExecutions from './features/pd-executions/PDExecutionsPage';
import IntegrationIssuesPage from './features/integration-issues/IntegrationIssuesPage';
import Reports from './features/reports/ReportsPage';
import Settings from './features/settings/SettingsPage';

import CommitteeQueue from './features/committee/CommitteeQueue';
import CommitteeCaseDetail from './features/committee/CommitteeCaseDetail';

import OidQueue from './features/oid-directory/OidQueue';
import OidDetail from './features/oid-directory/OidDetail';

import { UserRole } from './types/auth';
import {
    AuthSession,
    clearSession,
    persistSession,
    readSession,
    subscribeToSession,
} from './lib/authClient';

const App: React.FC = () => {
    const [session, setSession] = useState<AuthSession | null>(null);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
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
        session ? el : <Navigate to="/" replace />;

    return (
        <Routes>
            <Route
                path="/"
                element={
                    session ? (
                        <Navigate to="/dashboard" replace />
                    ) : (
                        <Login
                            onLogin={(userRole: UserRole) => {
                                const newSession = persistSession(userRole);
                                setSession(newSession);
                            }}
                        />
                    )
                }
            />

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
            <Route path="/pd-executions" element={requireAuth(<PDExecutions />)} />

            {/* Committee */}
            <Route path="/committee" element={requireAuth(<CommitteeQueue />)} />
            <Route
                path="/committee/:id"
                element={requireAuth(<CommitteeCaseDetail />)}
            />

            {/* OID Directory */}
            <Route path="/oids" element={requireAuth(<OidQueue />)} />
            <Route
                path="/oids/:oid"
                element={requireAuth(<OidDetail />)}
            />

            <Route
                path="/IntegrationIssues"
                element={requireAuth(
                    <IntegrationIssuesPage role={session?.role ?? null} />
                )}
            />

            <Route path="/reports" element={requireAuth(<Reports />)} />
            <Route path="/settings" element={requireAuth(<Settings />)} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default App;
