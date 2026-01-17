import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const publicRoutes = ['/login', '/forgot-password'];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                    <p className="text-sm text-gray-500">Loading session…</p>
                </div>
            </div>
        );
    }

    if (!user) {
        if (publicRoutes.includes(location.pathname)) {
            return <>{children}</>;
        }
        return <Navigate to="/login" replace />;
    }

    if (location.pathname === '/login') {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default AuthGate;
