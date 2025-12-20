import { UserRole } from '../types/auth';
import { getUsers } from '../features/settings/data/usersStore';
import { hashPassword } from './password';

const STORAGE_KEY = 'authSession';
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

export interface AuthSession {
    token: string;
    role: UserRole;
    issuedAt: number;
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

export const persistSession = (role: UserRole): AuthSession => {
    const session: AuthSession = {
        token: generateToken(),
        role,
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

export const authenticate = async (email: string, password: string) => {
    const providedHash = await hashPassword(password);
    const user = getUsers().find(
        demo => demo.email === email.toLowerCase() && demo.passwordHash === providedHash
    );

    if (!user) throw new Error('Invalid email or password');

    return user.role;
};
