import React from 'react';

import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';

const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

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
        return <LoginPage />;
    }

    return <>{children}</>;
};

export default AuthGate;
