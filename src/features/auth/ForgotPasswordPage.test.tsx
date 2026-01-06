import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordPage from './ForgotPasswordPage';
import {
    requestPasswordReset,
    resetPassword,
    PasswordResetRequestResult,
    PasswordResetResult,
} from '../../lib/authClient';

jest.mock('../../lib/authClient');
jest.mock('../../config/auth', () => ({ AUTH_MODE: 'oauth', isAuthEnabled: true }));

const mockNavigate = jest.fn();

jest.mock(
    'react-router-dom',
    () => ({
        useNavigate: () => mockNavigate,
    }),
    { virtual: true }
);

describe('ForgotPasswordPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('requests a reset and surfaces the development code', async () => {
        const requestResult: PasswordResetRequestResult = {
            email: 'admin@interoplens.io',
            via: 'local',
            message: 'Development reset code generated.',
            token: 'dev-token',
            expiresAt: Date.now() + 15 * 60 * 1000,
        };

        (requestPasswordReset as jest.Mock).mockResolvedValue(requestResult);

        render(<ForgotPasswordPage />);

        await userEvent.type(screen.getByLabelText(/email/i), 'admin@interoplens.io');
        await userEvent.click(screen.getByRole('button', { name: /send reset link/i }));

        await waitFor(() =>
            expect(requestPasswordReset).toHaveBeenCalledWith('admin@interoplens.io')
        );

        expect(await screen.findByText(/development reset code/i)).toBeInTheDocument();
        expect(screen.getByText(/dev-token/i)).toBeInTheDocument();
    });

    test('prevents mismatched password submission', async () => {
        const requestResult: PasswordResetRequestResult = {
            email: 'admin@interoplens.io',
            via: 'local',
            message: 'Code ready',
            token: 'abc',
            expiresAt: Date.now() + 15 * 60 * 1000,
        };

        (requestPasswordReset as jest.Mock).mockResolvedValue(requestResult);

        render(<ForgotPasswordPage />);

        await userEvent.type(screen.getByLabelText(/email/i), 'admin@interoplens.io');
        await userEvent.click(screen.getByRole('button', { name: /send reset link/i }));
        await waitFor(() => expect(requestPasswordReset).toHaveBeenCalled());

        await userEvent.type(screen.getByLabelText(/verification code/i), 'abc');
        await userEvent.type(screen.getByLabelText(/^new password/i), 'one-pass');
        await userEvent.type(screen.getByLabelText(/confirm password/i), 'different');
        await userEvent.click(screen.getByRole('button', { name: /update password/i }));

        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
        expect(resetPassword).not.toHaveBeenCalled();
    });

    test('submits a reset when passwords match', async () => {
        const requestResult: PasswordResetRequestResult = {
            email: 'admin@interoplens.io',
            via: 'local',
            message: 'Code ready',
            token: 'abc123',
            expiresAt: Date.now() + 15 * 60 * 1000,
        };
        const resetResult: PasswordResetResult = {
            email: 'admin@interoplens.io',
            via: 'remote',
            message: 'Password updated',
        };

        (requestPasswordReset as jest.Mock).mockResolvedValue(requestResult);
        (resetPassword as jest.Mock).mockResolvedValue(resetResult);

        render(<ForgotPasswordPage />);

        await userEvent.type(screen.getByLabelText(/email/i), 'admin@interoplens.io');
        await userEvent.click(screen.getByRole('button', { name: /send reset link/i }));
        await waitFor(() => expect(requestPasswordReset).toHaveBeenCalled());

        await userEvent.type(screen.getByLabelText(/verification code/i), 'abc123');
        await userEvent.type(screen.getByLabelText(/^new password/i), 'newpass!');
        await userEvent.type(screen.getByLabelText(/confirm password/i), 'newpass!');
        await userEvent.click(screen.getByRole('button', { name: /update password/i }));

        await waitFor(() =>
            expect(resetPassword).toHaveBeenCalledWith(
                'admin@interoplens.io',
                'abc123',
                'newpass!'
            )
        );

        expect(screen.getByText(/password updated/i)).toBeInTheDocument();
    });
});
