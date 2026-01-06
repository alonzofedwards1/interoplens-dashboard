import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ReportsPage from './ReportsPage';

jest.mock('../../lib/AuthContext', () => ({
    useAuth: () => ({ isAuthenticated: true, user: { email: 'demo@example.com' } }),
}));

const mockNavigate = jest.fn();

jest.mock(
    'react-router-dom',
    () => ({
        __esModule: true,
        useNavigate: () => mockNavigate,
    }),
    { virtual: true }
);

describe('ReportsPage', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-02-06T12:00:00Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('surfaces catalog stats and available reports by default', () => {
        render(<ReportsPage />);

        expect(screen.getByText(/showing 4 of 4 reports/i)).toBeInTheDocument();
        expect(screen.getByText(/tefca readiness assessment/i)).toBeInTheDocument();
        expect(screen.getByText(/tefca interoperability snapshot/i)).toBeInTheDocument();
        expect(screen.getByText(/pd anomaly deep dive/i)).toBeInTheDocument();
        expect(screen.getByText(/certificate renewal forecast/i)).toBeInTheDocument();
    });

    it('filters reports by environment and status', async () => {
        render(<ReportsPage />);

        const [, environmentSelect, statusSelect] = screen.getAllByRole('combobox');

        await userEvent.selectOptions(environmentSelect, 'prod');

        expect(screen.getByText(/tefca readiness assessment/i)).toBeInTheDocument();
        expect(screen.getByText(/pd anomaly deep dive/i)).toBeInTheDocument();
        expect(screen.queryByText(/tefca interoperability snapshot/i)).not.toBeInTheDocument();

        await userEvent.selectOptions(statusSelect, 'failing');

        expect(screen.getByText(/pd anomaly deep dive/i)).toBeInTheDocument();
        expect(screen.queryByText(/tefca readiness assessment/i)).not.toBeInTheDocument();

        await userEvent.selectOptions(statusSelect, 'all');

        await userEvent.selectOptions(environmentSelect, 'sandbox');

        expect(screen.getByText(/certificate renewal forecast/i)).toBeInTheDocument();
    });

    it('opens report detail when viewing a card', async () => {
        render(<ReportsPage />);

        const [, environmentSelect] = screen.getAllByRole('combobox');
        await userEvent.selectOptions(environmentSelect, 'prod');

        const viewButtons = screen.getAllByRole('button', { name: /view/i });
        await userEvent.click(viewButtons[0]);

        expect(screen.getByText(/executive summary/i)).toBeInTheDocument();
    });
});
