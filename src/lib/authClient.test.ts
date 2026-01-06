import { webcrypto } from 'crypto';
import { TextEncoder } from 'util';
import { authenticate, AuthenticatedUser, clearSession, persistSession, readSession, subscribeToSession } from './authClient';
import { UserRole } from '../types/auth';

const mockFetch = global.fetch as jest.Mock | undefined;

describe('authClient', () => {
    const originalVisibility = Object.getOwnPropertyDescriptor(document, 'visibilityState');

    beforeAll(() => {
        Object.defineProperty(global, 'TextEncoder', { value: TextEncoder });
        Object.defineProperty(global, 'crypto', { value: webcrypto });
    });

    beforeEach(() => {
        sessionStorage.clear();
        localStorage.clear();
        jest.restoreAllMocks();
        if (originalVisibility) {
            Object.defineProperty(document, 'visibilityState', originalVisibility);
        }
        global.fetch = jest.fn();
    });

    afterAll(() => {
        if (mockFetch) {
            global.fetch = mockFetch;
        }
    });

    test('authenticates with server response', async () => {
        const authResponse = {
            digest: 'server-digest',
            user: {
                id: 'user-admin',
                name: 'Admin User',
                email: 'admin@interoplens.io',
                role: 'admin',
            },
        };

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(authResponse),
        });

        const result = await authenticate('admin@interoplens.io', 'admin123');

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/auth/token'),
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
            })
        );
        expect(result).toEqual({
            token: authResponse.digest,
            user: authResponse.user,
        });
    });

    test('falls back to seeded users when server is missing OAuth env vars', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            status: 500,
            json: jest.fn().mockResolvedValue({
                message:
                    'Missing OAuth environment variables: OAUTH_TOKEN_URL, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTH_USERNAME, OAUTH_PASSWORD',
            }),
        });

        const result = await authenticate('admin@interoplens.io', 'admin123');

        expect(result.user.email).toBe('admin@interoplens.io');
        expect(result.user.role).toBe('admin');
        expect(result.token).toBeTruthy();
    });

    test('accepts alternate token shapes from server', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ data: { token: 'session-token' } }),
        });

        const result = await authenticate('admin@interoplens.io', 'admin123');

        expect(result.token).toBe('session-token');
        expect(result.user.email).toBe('admin@interoplens.io');
    });

    test('throws a readable error when server rejects', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            status: 401,
            json: jest.fn().mockResolvedValue({ message: 'Invalid credentials' }),
        });

        await expect(authenticate('admin@interoplens.io', 'wrong')).rejects.toThrow(
            'Invalid credentials'
        );
    });

    test('rejects invalid response payloads', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({}),
        });

        await expect(authenticate('admin@interoplens.io', 'admin123')).rejects.toThrow(
            'Login failed: invalid response from server'
        );
    });

    test('persists and reads a valid session with server token', () => {
        const demoUser: AuthenticatedUser = {
            id: 'user-analyst',
            name: 'Analyst User',
            email: 'analyst@interoplens.io',
            role: 'analyst',
        };
        const session = persistSession(demoUser, 'server-token');

        expect(session.token).toBe('server-token');
        expect(readSession()).toMatchObject({
            role: 'analyst',
            token: 'server-token',
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
