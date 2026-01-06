import { authenticate, clearSession, readSession } from './authClient';

describe('authClient', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('stores a mocked session on authenticate', async () => {
        const result = await authenticate('user@example.com', 'password');

        expect(result.user.email).toBe('user@example.com');
        expect(localStorage.getItem('interoplens.auth')).toBeTruthy();
    });

    it('clears the session', async () => {
        await authenticate('user@example.com', 'password');
        clearSession();

        expect(readSession()).toBeNull();
    });

    it('validates required credentials', async () => {
        await expect(authenticate('', '')).rejects.toThrow(/required/);
    });
});
