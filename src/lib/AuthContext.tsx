import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'interoplens.auth';

export type AuthUser = {
    email: string;
    name: string;
    role: 'admin' | 'analyst' | 'committee';
};

type AuthContextValue = {
    isAuthenticated: boolean;
    user: AuthUser | null;
    login: (user: Partial<AuthUser> & { email: string }) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredAuth = (): AuthUser | null => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as Partial<AuthUser>;
        if (!parsed.email) return null;

        return {
            email: parsed.email,
            name: parsed.name ?? parsed.email,
            role: parsed.role ?? 'admin',
        };
    } catch (error) {
        console.error('Failed to parse auth state', error);
        return null;
    }
};

const persistAuth = (state: AuthUser | null) => {
    if (!state) {
        localStorage.removeItem(STORAGE_KEY);
        return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(() => readStoredAuth());

    useEffect(() => {
        const stored = readStoredAuth();
        setUser(stored);
    }, []);

    const login = (userInput: Partial<AuthUser> & { email: string }) => {
        const normalizedEmail = userInput.email.trim().toLowerCase();
        // TODO: Replace this mocked login with real backend authentication when available.
        const nextUser: AuthUser = {
            email: normalizedEmail,
            name: userInput.name?.trim() || normalizedEmail,
            role: userInput.role || 'admin',
        };
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
