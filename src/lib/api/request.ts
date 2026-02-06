import { authFetch } from './auth';
import { safeJson } from './utils';

const readErrorMessage = async (response: Response) => {
    const fallback = `${response.status} ${response.statusText}`.trim();

    try {
        const data = await safeJson(response.clone());
        if (data && typeof data === 'object' && 'message' in data) {
            const message = (data as { message?: string }).message;
            if (message) return message;
        }
    } catch {
        // Ignore JSON parsing errors
    }

    try {
        const text = await response.text();
        if (text) return text;
    } catch {
        // Ignore body read errors
    }

    return fallback || 'Request failed';
};

export async function requestJson<T>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await authFetch(url, options);

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }

    return (await safeJson(response)) as T;
}

export async function requestOk(
    url: string,
    options: RequestInit = {}
): Promise<void> {
    const response = await authFetch(url, options);

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }
}
