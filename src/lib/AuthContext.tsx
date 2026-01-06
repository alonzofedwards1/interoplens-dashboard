import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'interoplens.auth';

type AuthState = {
    email: string;
};

type AuthContextValue = {
    isAuthenticated: boolean;
    user: AuthState | null;
    login: (email: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredAuth = (): AuthState | null => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as { email?: string };
        return parsed.email ? { email: parsed.email } : null;
    } catch (error) {
        console.error('Failed to parse auth state', error);
        return null;
    }
};

const persistAuth = (state: AuthState | null) => {
    if (!state) {
        localStorage.removeItem(STORAGE_KEY);
        return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthState | null>(() => readStoredAuth());

    useEffect(() => {
        const stored = readStoredAuth();
        setUser(stored);
    }, []);

    const login = (email: string) => {
        const normalizedEmail = email.trim().toLowerCase();
        // TODO: Replace this mocked login with real backend authentication when available.
        const nextUser = { email: normalizedEmail };
        setUser(nextUser);
        persistAuth(nextUser);
    };

    const logout = () => {
        setUser(null);
        persistAuth(null);
    };

    const value = useMemo(
        () => ({ isAuthenticated: Boolean(user), user, login, logout }),
        [user]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};
