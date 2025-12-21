import { webcrypto } from 'crypto';
import { TextEncoder } from 'util';
import {
    AuthenticatedUser,
    authenticate,
    clearSession,
    persistSession,
    readSession,
    subscribeToSession,
} from './authClient';
import { UserRole } from '../types/auth';
import { addUser, resetUsers } from '../features/settings/data/usersStore';

describe('authClient', () => {
    const originalVisibility = Object.getOwnPropertyDescriptor(
        document,
        'visibilityState'
    );

    beforeAll(() => {
        Object.defineProperty(global, 'TextEncoder', { value: TextEncoder });
        Object.defineProperty(global, 'crypto', { value: webcrypto });
    });

    beforeEach(() => {
        sessionStorage.clear();
        localStorage.clear();
        resetUsers();
        jest.restoreAllMocks();
        if (originalVisibility) {
            Object.defineProperty(document, 'visibilityState', originalVisibility);
        }
    });

    test('authenticates a known demo user with the expected password', async () => {
        const user = await authenticate('admin@interoplens.io', 'admin123');

        expect(user).toMatchObject({
            id: 'user-admin',
            email: 'admin@interoplens.io',
            role: 'admin',
        });
    });

    test('rejects invalid credentials', async () => {
        await expect(authenticate('admin@interoplens.io', 'wrong')).rejects.toThrow(
            'Invalid email or password'
        );
    });

    test('authenticates a newly added user', async () => {
        await addUser({
            name: 'Ops Owner',
            email: 'ops@example.com',
            role: 'analyst',
            password: 'ops12345',
        });

        const user = await authenticate('ops@example.com', 'ops12345');

        expect(user.role).toBe('analyst');
    });

    test('persists and reads a valid session', () => {
        const demoUser: AuthenticatedUser = {
            id: 'user-analyst',
            name: 'Analyst User',
            email: 'analyst@interoplens.io',
            role: 'analyst',
        };
        const session = persistSession(demoUser);

        expect(session.token).toBeTruthy();
        expect(readSession()).toMatchObject({
            role: 'analyst',
            token: session.token,
            email: demoUser.email,
        });
    });

    test('returns null when an existing session is expired', () => {
        const expired = {
            token: 'stale',
            role: 'committee' as UserRole,
            issuedAt: Date.now() - 31 * 60 * 1000,
        };

        sessionStorage.setItem('authSession', JSON.stringify(expired));

        expect(readSession()).toBeNull();
        expect(sessionStorage.getItem('authSession')).toBeTruthy();
    });

    test('invokes the subscription callback on storage and visibility changes', () => {
        const callback = jest.fn();
        const unsubscribe = subscribeToSession(callback);

        window.dispatchEvent(
            new StorageEvent('storage', {
                key: 'authSession',
                storageArea: sessionStorage,
            })
        );

        Object.defineProperty(document, 'visibilityState', {
            configurable: true,
            value: 'visible',
        });
        document.dispatchEvent(new Event('visibilitychange'));

        expect(callback).toHaveBeenCalledTimes(2);

        unsubscribe();
        clearSession();
    });
});
