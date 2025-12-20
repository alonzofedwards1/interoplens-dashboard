import { UserRole } from '../types/auth';

interface DemoUser {
    email: string;
    passwordHash: string;
    role: UserRole;
}

const STORAGE_KEY = 'authSession';
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

const DEMO_USERS: DemoUser[] = [
    {
        email: 'admin@interoplens.io',
        passwordHash:
            '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
        role: 'admin',
    },
    {
        email: 'analyst@interoplens.io',
        passwordHash:
            'da3c7436e41590a9f7c2195af2940a678d72e13018c8e748c88394439424bdd5',
        role: 'analyst',
    },
    {
        email: 'committee@interoplens.io',
        passwordHash:
            '4cd12d8f6611827a17b1c720288efe092047de6539e388ad046a785c1fe2f33a',
        role: 'committee',
    },
];

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

const toHex = (buffer: ArrayBuffer) =>
    Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

const hashPassword = async (password: string) => {
    const encoded = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest('SHA-256', encoded);
    return toHex(digest);
};

export const authenticate = async (email: string, password: string) => {
    const providedHash = await hashPassword(password);
    const user = DEMO_USERS.find(
        demo => demo.email === email && demo.passwordHash === providedHash
    );

    if (!user) throw new Error('Invalid email or password');

    return user.role;
};
