import { API_BASE_URL } from '../config/api';
import { isAuthEnabled } from '../config/auth';
import { UserRole } from '../types/auth';
import { getUsers, updateUserPassword } from '../features/settings/data/usersStore';
import { consumeLocalResetToken, issueLocalResetToken } from './passwordReset';
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

export interface PasswordResetRequestResult {
    email: string;
    via: 'remote' | 'local';
    message: string;
    token?: string;
    expiresAt?: number;
}

export interface PasswordResetResult {
    email: string;
    via: 'remote' | 'local';
    message: string;
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

export const getSessionToken = () => readSession()?.token ?? null;

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
    if (!isAuthEnabled) {
        return {
            user: normalizeUser({ email }, email),
            token: generateToken(),
        };
    }

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

export const requestPasswordReset = async (
    email: string
): Promise<PasswordResetRequestResult> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!isAuthEnabled) {
        return {
            email: normalizedEmail,
            via: 'local',
            message: 'Authentication is disabled; no reset is required.',
        };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/password/forgot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: normalizedEmail }),
        });

        if (response.ok) {
            const body = await safeJson(response);
            return {
                email: normalizedEmail,
                via: 'remote',
                message:
                    (typeof body?.message === 'string' && body.message) ||
                    'If that account exists, a reset link has been sent to your email.',
            };
        }

        const message = await safeErrorMessage(response);
        if (!shouldAttemptLocalFallback(message ?? response.status.toString())) {
            throw new Error(message ?? 'Unable to send reset email');
        }
    } catch (error) {
        if (!shouldAttemptLocalFallback(error)) {
            throw new Error('Unable to send reset email');
        }
    }

    const users = getUsers();
    const user = users.find(candidate => candidate.email === normalizedEmail);

    if (!user) {
        throw new Error('No account found for that email');
    }

    const record = issueLocalResetToken(normalizedEmail);
    return {
        email: normalizedEmail,
        via: 'local',
        token: record.token,
        expiresAt: record.expiresAt,
        message:
            'Development reset code generated. Use the verification code to set a new password.',
    };
};

export const resetPassword = async (
    email: string,
    token: string,
    newPassword: string
): Promise<PasswordResetResult> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!isAuthEnabled) {
        return {
            email: normalizedEmail,
            via: 'local',
            message: 'Authentication is disabled; no reset is required.',
        };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/password/reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: normalizedEmail, token, password: newPassword }),
        });

        if (response.ok) {
            const body = await safeJson(response);
            return {
                email: normalizedEmail,
                via: 'remote',
                message:
                    (typeof body?.message === 'string' && body.message) ||
                    'Password updated successfully. You can now sign in.',
            };
        }

        const message = await safeErrorMessage(response);
        if (!shouldAttemptLocalFallback(message ?? response.status.toString())) {
            throw new Error(message ?? 'Unable to reset password');
        }
    } catch (error) {
        if (!shouldAttemptLocalFallback(error)) {
            throw new Error('Unable to reset password');
        }
    }

    const record = consumeLocalResetToken(normalizedEmail, token);
    if (!record) {
        throw new Error('Invalid or expired reset code');
    }

    const updatedUser = await updateUserPassword(normalizedEmail, newPassword);
    if (!updatedUser) {
        throw new Error('No account found for that email');
    }

    return {
        email: normalizedEmail,
        via: 'local',
        message: 'Password updated for development account. You can now sign in.',
    };
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

const shouldAttemptLocalFallback = (reason: unknown) => {
    if (reason instanceof Error) {
        return /oauth|unable to reach authentication service|network/i.test(
            reason.message
        );
    }

    if (typeof reason === 'string') {
        return /oauth|unable to reach authentication service|404|5\d{2}|network/i.test(
            reason
        );
    }

    if (typeof reason === 'number') {
        return reason === 404 || reason >= 500;
    }

    return false;
};

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

const safeJson = async (response: Response) => {
    try {
        return await response.json();
    } catch (error) {
        return null;
    }
};
