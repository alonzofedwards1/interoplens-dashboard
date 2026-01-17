const API_BASE = "http://localhost:8081/api";

/**
 * Central fetch wrapper that ALWAYS sends cookies.
 * If this is wrong, sessions will never persist.
 */
export async function authFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    return fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });
}

export async function login(username: string, password: string) {
    const res = await authFetch(`${API_BASE}/auth/login`, {
        method: "POST",
        body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Login failed");
    }

    return res.json();
}

export async function logout() {
    const res = await authFetch(`${API_BASE}/auth/logout`, {
        method: "POST",
    });

    if (!res.ok) {
        throw new Error("Logout failed");
    }
}

export async function me() {
    const res = await authFetch(`${API_BASE}/auth/me`);
    if (!res.ok) throw new Error("Not authenticated");
    return res.json();
}
