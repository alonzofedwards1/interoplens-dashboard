import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ViewAllFindings from './pages/ViewAllFindings';
import PDExecutions from './pages/PDExecutions';
import IntegrationIssuesPage from './pages/issues/IntegrationIssuesPage';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

import CommitteeQueue from './committee/CommitteeQueue';
import CommitteeCaseDetail from './committee/CommitteeCaseDetail';

import OidQueue from './oidDirectory/OidQueue';
import OidDetail from './oidDirectory/OidDetail';

export type UserRole = 'admin' | 'analyst' | 'committee';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState<UserRole | null>(null);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const auth = sessionStorage.getItem('auth');
        const storedRole = sessionStorage.getItem('role') as UserRole | null;
        if (auth === 'true' && storedRole) {
            setIsAuthenticated(true);
            setRole(storedRole);
        }
        setAuthChecked(true);
    }, []);

    if (!authChecked) return null;

    const requireAuth = (el: React.ReactElement) =>
        isAuthenticated ? el : <Navigate to="/" replace />;

    return (
        <Routes>
            <Route
                path="/"
                element={
                    isAuthenticated ? (
                        <Navigate to="/dashboard" replace />
                    ) : (
                        <Login
                            onLogin={(userRole: UserRole) => {
                                sessionStorage.setItem('auth', 'true');
                                sessionStorage.setItem('role', userRole);
                                setIsAuthenticated(true);
                                setRole(userRole);
                            }}
                        />
                    )
                }
            />

            <Route
                path="/dashboard"
                element={requireAuth(
                    <Dashboard
                        role={role}
                        onLogout={() => {
                            sessionStorage.clear();
                            setIsAuthenticated(false);
                            setRole(null);
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
                element={requireAuth(<IntegrationIssuesPage role={role} />)}
            />

            <Route path="/reports" element={requireAuth(<Reports />)} />
            <Route path="/settings" element={requireAuth(<Settings />)} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default App;
