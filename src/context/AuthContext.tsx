import React, { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth";

type User = {
    userId: number;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                          children,
                                                                      }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Called once on app startup to restore session from cookie
    async function loadSession() {
        try {
            const me = await authApi.me();
            setUser(me);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSession();
    }, []);

    async function login(username: string, password: string) {
        await authApi.login(username, password);
        const me = await authApi.me();
        setUser(me);
    }

    async function logout() {
        await authApi.logout();
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return ctx;
}
