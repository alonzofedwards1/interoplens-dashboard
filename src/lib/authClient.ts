export interface AuthenticatedUser {
    id: string;
    name: string;
    email: string;
    role: 'analyst';
}

export interface AuthSession extends AuthenticatedUser {}

const STORAGE_KEY = 'interoplens.auth';

const createUserFromEmail = (email: string): AuthenticatedUser => {
    const normalizedEmail = email.trim().toLowerCase();
    return {
        id: normalizedEmail,
        name: normalizedEmail,
        email: normalizedEmail,
        role: 'analyst',
    };
};

export const authenticate = async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
        throw new Error('Email and password are required.');
    }

    const user = createUserFromEmail(email);
    // TODO: Swap this mocked login with backend authentication when available.
    persistSession(user);
    return { user };
};

export const readSession = (): AuthSession | null => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as AuthSession;
        return parsed?.email ? parsed : null;
    } catch (error) {
        console.error('Failed to parse auth session', error);
        return null;
    }
};

export const persistSession = (user: AuthenticatedUser): AuthSession => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
};

export const clearSession = () => localStorage.removeItem(STORAGE_KEY);
