import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './LoginPage';
import { authenticate, AuthResult } from '../../lib/authClient';

jest.mock('../../lib/authClient');

const mockNavigate = jest.fn();

jest.mock(
    'react-router-dom',
    () => ({
        useNavigate: () => mockNavigate,
    }),
    { virtual: true }
);

describe('LoginPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('authenticates and redirects on success', async () => {
        const authResult: AuthResult = {
            user: {
                id: 'user-admin',
                email: 'admin@interoplens.io',
                name: 'Interoplens Admin',
                role: 'admin',
            },
            token: 'secure-token',
        };
        (authenticate as jest.Mock).mockResolvedValue(authResult);
        const onLogin = jest.fn();

        render(<Login onLogin={onLogin} />);

        const emailInput = screen
            .getByText(/email/i)
            .nextElementSibling as HTMLInputElement;
        const passwordInput = screen
            .getByText(/password/i)
            .nextElementSibling as HTMLInputElement;

        await userEvent.type(emailInput, 'admin@interoplens.io');
        await userEvent.type(passwordInput, 'admin123');
        await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => expect(onLogin).toHaveBeenCalledWith(authResult));

        expect(authenticate).toHaveBeenCalledWith(
            'admin@interoplens.io',
            'admin123'
        );
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });

    test('shows an error message when authentication fails', async () => {
        (authenticate as jest.Mock).mockRejectedValue(
            new Error('Invalid email or password')
        );
        const onLogin = jest.fn();

        render(<Login onLogin={onLogin} />);

        const emailInput = screen
            .getByText(/email/i)
            .nextElementSibling as HTMLInputElement;
        const passwordInput = screen
            .getByText(/password/i)
            .nextElementSibling as HTMLInputElement;

        await userEvent.type(emailInput, 'admin@interoplens.io');
        await userEvent.type(passwordInput, 'wrong');
        await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() =>
            expect(
                screen.getByText(/invalid email or password/i)
            ).toBeInTheDocument()
        );

        expect(onLogin).not.toHaveBeenCalled();
    });
});
