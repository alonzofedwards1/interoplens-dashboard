import { API_BASE_URL } from '../config/api';
import { UserRole } from '../types/auth';
import { getUsers } from '../features/settings/data/usersStore';
import { hashPassword } from './password';

const STORAGE_KEY = 'authSession';
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

export interface AuthenticatedUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

export interface AuthSession extends AuthenticatedUser {
    token: string;
    issuedAt: number;
}

export interface AuthResult {
    user: AuthenticatedUser;
    token: string;
}

const generateToken = () =>
    typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const isExpired = (issuedAt: number) => Date.now() - issuedAt > SESSION_TTL_MS;

const parseSession = (raw: string | null): AuthSession | null => {
    if (!raw) return null;

    try {
        const session = JSON.parse(raw) as AuthSession;
        return isExpired(session.issuedAt) ? null : session;
    } catch (error) {
        console.error('Failed to parse auth session', error);
        return null;
    }
};

export const readSession = (): AuthSession | null =>
    parseSession(sessionStorage.getItem(STORAGE_KEY));

export const persistSession = (user: AuthenticatedUser, token?: string): AuthSession => {
    const session: AuthSession = {
        ...user,
        token: token ?? generateToken(),
        issuedAt: Date.now(),
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
};

export const clearSession = () => sessionStorage.removeItem(STORAGE_KEY);

export const subscribeToSession = (callback: () => void) => {
    const handleStorage = (event: StorageEvent) => {
        if (event.storageArea === sessionStorage && event.key === STORAGE_KEY) {
            callback();
        }
    };

    const handleVisibility = () => {
        if (document.visibilityState === 'visible') {
            callback();
        }
    };

    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
        window.removeEventListener('storage', handleStorage);
        document.removeEventListener('visibilitychange', handleVisibility);
    };
};

const normalizeUser = (
    user: Partial<AuthenticatedUser> | undefined,
    fallbackEmail: string
): AuthenticatedUser => {
    if (!user?.email && !fallbackEmail) {
        throw new Error('Login failed: missing user identity');
    }

    return {
        id: user?.id ?? user?.email ?? fallbackEmail,
        name: user?.name ?? user?.email ?? fallbackEmail,
        email: (user?.email ?? fallbackEmail).toLowerCase(),
        role: user?.role ?? 'analyst',
    };
};

const extractToken = (data: unknown): string | undefined => {
    if (!data || typeof data !== 'object') return undefined;

    const candidate =
        (data as { digest?: unknown }).digest ??
        (data as { token?: unknown }).token ??
        (data as { data?: { digest?: unknown; token?: unknown } }).data?.digest ??
        (data as { data?: { digest?: unknown; token?: unknown } }).data?.token;

    return typeof candidate === 'string' ? candidate : undefined;
};

const extractUser = (data: unknown): Partial<AuthenticatedUser> | undefined => {
    if (!data || typeof data !== 'object') return undefined;

    const user =
        (data as { user?: Partial<AuthenticatedUser> }).user ??
        (data as { data?: { user?: Partial<AuthenticatedUser> } }).data?.user;

    return user;
};

export const authenticate = async (email: string, password: string): Promise<AuthResult> => {
    try {
        return await authenticateRemote(email, password);
    } catch (error) {
        const fallback = shouldAttemptLocalFallback(error)
            ? await authenticateLocally(email, password)
            : null;

        if (fallback) {
            return fallback;
        }

        throw error instanceof Error && shouldAddOAuthHint(error)
            ? new Error(
                  `${error.message} (or configure OAuth credentials via OAUTH_TOKEN_URL, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTH_USERNAME, OAUTH_PASSWORD)`
              )
            : error;
    }
};

const authenticateRemote = async (email: string, password: string): Promise<AuthResult> => {
    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}/api/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
    } catch (error) {
        throw new Error('Login failed: unable to reach authentication service');
    }

    if (!response.ok) {
        const message = await safeErrorMessage(response);
        throw new Error(message ?? `Login failed: ${response.status}`);
    }

    let data: unknown;
    try {
        data = await response.json();
    } catch (error) {
        throw new Error('Login failed: invalid response from server');
    }

    const digest = extractToken(data);
    const user = extractUser(data);

    if (!digest) {
        throw new Error('Login failed: invalid response from server');
    }

    const normalizedUser = normalizeUser(user, email);

    return { user: normalizedUser, token: digest };
};

const authenticateLocally = async (email: string, password: string): Promise<AuthResult | null> => {
    const normalizedEmail = email.trim().toLowerCase();
    const users = getUsers();
    const user = users.find(candidate => candidate.email === normalizedEmail);

    if (!user) return null;

    const passwordHash = await hashPassword(password);
    if (passwordHash !== user.passwordHash) return null;

    const normalizedUser: AuthenticatedUser = {
        id: user.id,
        name: user.name,
        email: normalizedEmail,
        role: user.role,
    };

    return { user: normalizedUser, token: generateToken() };
};

const shouldAttemptLocalFallback = (error: unknown) =>
    error instanceof Error && /oauth|unable to reach authentication service/i.test(error.message);

const shouldAddOAuthHint = (error: Error) => /oauth/i.test(error.message);

const safeErrorMessage = async (response: Response) => {
    try {
        const body = await response.json();
        if (typeof body?.message === 'string') return body.message;
        if (typeof body?.detail === 'string') return body.detail;
    } catch (error) {
        // ignore JSON parse failures
    }
    return undefined;
};
