import { API_BASE } from '../apiBase';
import { safeJson } from './utils';

export type User = {
    userId: number;
};

const fetchWithSession = async (path: string, options: RequestInit = {}) => {
    const headers: HeadersInit = {
        ...(options.headers ?? {}),
    };

    if (!('Content-Type' in headers) && options.body) {
        (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    return fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        credentials: 'include',
    });
};

const readJsonIfAvailable = async (response: Response) => {
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) return null;
    return safeJson(response);
};

export const login = async (username: string, password: string): Promise<void> => {
    const res = await fetchWithSession('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
        throw new Error(`Login failed (${res.status})`);
    }
};

export const logout = async (): Promise<void> => {
    const res = await fetchWithSession('/api/auth/logout', {
        method: 'POST',
    });

    if (!res.ok) {
        throw new Error(`Logout failed (${res.status})`);
    }
};

export const me = async (): Promise<User | null> => {
    const res = await fetchWithSession('/api/auth/me', { method: 'GET' });

    if (res.status === 401) return null;

    if (!res.ok) {
        throw new Error(`Session check failed (${res.status})`);
    }

    const data = (await readJsonIfAvailable(res)) as User | null;
    if (!data?.userId) return null;

    return { userId: data.userId };
};

export const authFetch = async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    });
};
