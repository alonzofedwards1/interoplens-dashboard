import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../../pages/LoginPage';
import { useAuth } from '../../context/AuthContext';

jest.mock('../../context/AuthContext');

const mockNavigate = jest.fn();

jest.mock(
    'react-router-dom',
    () => ({
        useNavigate: () => mockNavigate,
    }),
    { virtual: true }
);

describe('LoginPage', () => {
    const mockLogin = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({ login: mockLogin });
    });

    test('authenticates locally and redirects on success', async () => {
        mockLogin.mockResolvedValue(undefined);
        render(<Login />);

        const emailInput = screen.getByLabelText(/username/i) as HTMLInputElement;
        const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

        await userEvent.type(emailInput, 'admin@interoplens.io');
        await userEvent.type(passwordInput, 'admin123');
        await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() =>
            expect(mockLogin).toHaveBeenCalledWith('admin@interoplens.io', 'admin123')
        );
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });

    test('shows an error message when validation fails', async () => {
        render(<Login />);

        await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() =>
            expect(screen.getByText(/username and password are required/i)).toBeInTheDocument()
        );

        expect(mockLogin).not.toHaveBeenCalled();
    });
});
