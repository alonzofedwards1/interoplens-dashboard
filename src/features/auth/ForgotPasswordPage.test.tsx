import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordPage from './ForgotPasswordPage';

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

    it('shows validation message when email is empty', async () => {
        render(<ForgotPasswordPage />);

        await userEvent.click(screen.getByRole('button', { name: /send reset instructions/i }));

        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    it('shows success message when email is provided', async () => {
        render(<ForgotPasswordPage />);

        await userEvent.type(screen.getByLabelText(/email/i), 'demo@example.com');
        await userEvent.click(screen.getByRole('button', { name: /send reset instructions/i }));

        expect(
            screen.getByText(/password reset is currently handled offline/i)
        ).toBeInTheDocument();
    });

    it('navigates back to login', async () => {
        render(<ForgotPasswordPage />);

        await userEvent.click(screen.getByRole('button', { name: /back to sign in/i }));

        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
});
