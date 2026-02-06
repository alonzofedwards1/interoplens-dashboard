import { API_BASE_URL } from '../../config/api';
import { safeJson } from './utils';
import { requestOk } from './request';

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

export const login = async (username: string, password: string): Promise<void> => {
    await requestOk('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
};

export const logout = async (): Promise<void> => {
    await requestOk('/api/auth/logout', {
        method: 'POST',
    });
};

export const me = async (): Promise<User | null> => {
    const res = await authFetch('/api/auth/me', { method: 'GET' });

    if (res.status === 401) return null;

    if (!res.ok) {
        const message = `Session check failed (${res.status})`;
        throw new Error(message);
    }

    const data = (await readJsonIfAvailable(res)) as User | null;
    if (!data?.userId) return null;

    return { userId: data.userId };
};
