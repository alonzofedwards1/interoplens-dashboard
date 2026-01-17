import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import * as authApi from '../lib/api/auth';

export type AuthUser = authApi.User;

type AuthContextValue = {
    user: AuthUser | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const sessionUser = await authApi.me();
            setUser(sessionUser);
        } catch (error) {
            console.error('Failed to refresh session', error);
            setUser(null);
        }
    }, []);

    const login = useCallback(async (username: string, password: string) => {
        await authApi.login(username, password);
        const sessionUser = await authApi.me();
        if (!sessionUser) {
            throw new Error('Unable to load session');
        }
        setUser({ userId: sessionUser.userId });
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadSession = async () => {
            try {
                await refreshUser();
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadSession();
        return () => {
            isMounted = false;
        };
    }, [refreshUser]);

    const value = useMemo(
        () => ({ user, loading, login, logout, refreshUser }),
        [user, loading, login, logout, refreshUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};
