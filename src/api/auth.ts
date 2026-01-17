import { safeJson } from '../lib/apiClient';

export type AuthUser = {
    username: string;
};

type LoginResponse = {
    username: string;
    expiresAt: string;
};

const authFetch = async (input: RequestInfo, init?: RequestInit) =>
    fetch(input, {
        credentials: 'include',
        ...init,
    });

const readErrorMessage = async (response: Response, fallback: string) => {
    const data = await safeJson(response);
    if (data && typeof data === 'object' && 'message' in data) {
        const message = (data as { message?: string }).message;
        if (message) return message;
    }
    return fallback;
};

export const login = async (username: string, password: string): Promise<LoginResponse> => {
    const res = await authFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
        const message = await readErrorMessage(res, `Login failed (${res.status})`);
        throw new Error(message);
    }

    const data = (await safeJson(res)) as LoginResponse;
    if (!data?.username) {
        throw new Error('Invalid login response');
    }

    return data;
};

export const logout = async (): Promise<void> => {
    const res = await authFetch('/api/auth/logout', {
        method: 'POST',
    });

    if (!res.ok) {
        const message = await readErrorMessage(res, `Logout failed (${res.status})`);
        throw new Error(message);
    }
};

export const me = async (): Promise<AuthUser | null> => {
    const res = await authFetch('/api/auth/me');

    if (res.status === 401) return null;

    if (!res.ok) {
        const message = await readErrorMessage(res, `Session check failed (${res.status})`);
        throw new Error(message);
    }

    const data = (await safeJson(res)) as AuthUser | null;
    if (!data?.username) return null;

    return { username: data.username };
};
