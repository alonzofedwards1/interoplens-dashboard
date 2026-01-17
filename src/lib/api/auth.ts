import { API_BASE_URL } from '../../config/api';
import { safeJson } from '../apiClient';

export type User = {
    userId: number;
};

const resolveAuthUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
    return `${API_BASE_URL}/${url}`;
};

export async function authFetch(url: string, options: RequestInit = {}) {
    return fetch(resolveAuthUrl(url), {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    });
}

const readJsonIfAvailable = async (response: Response) => {
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) return null;
    return safeJson(response);
};

const readErrorMessage = async (response: Response, fallback: string) => {
    const data = await readJsonIfAvailable(response.clone());
    if (data && typeof data === 'object' && 'message' in data) {
        const message = (data as { message?: string }).message;
        if (message) return message;
    }
    return fallback;
};

export const login = async (username: string, password: string): Promise<void> => {
    const res = await authFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
        const message = await readErrorMessage(res, `Login failed (${res.status})`);
        throw new Error(message);
    }
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

export const me = async (): Promise<User | null> => {
    const res = await authFetch('/api/auth/me', {
        method: 'GET',
    });

    if (res.status === 401) return null;

    if (!res.ok) {
        const message = await readErrorMessage(res, `Session check failed (${res.status})`);
        throw new Error(message);
    }

    const data = (await readJsonIfAvailable(res)) as User | null;
    if (!data?.userId) return null;

    return { userId: data.userId };
};
