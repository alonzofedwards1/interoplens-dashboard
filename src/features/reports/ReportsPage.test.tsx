import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ReportsPage from './ReportsPage';

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

        expect(
            screen.getByText(/showing 4 of 4 reports/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/tefca readiness assessment/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/tefca interoperability snapshot/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/pd anomaly deep dive/i)).toBeInTheDocument();
        expect(
            screen.getByText(/certificate renewal forecast/i)
        ).toBeInTheDocument();
    });

    it('filters reports by environment and status', async () => {
        render(<ReportsPage />);

        await userEvent.selectOptions(
            screen.getByDisplayValue(/all environments/i),
            'prod'
        );

        expect(
            screen.getByText(/tefca readiness assessment/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/pd anomaly deep dive/i)).toBeInTheDocument();
        expect(
            screen.queryByText(/tefca interoperability snapshot/i)
        ).not.toBeInTheDocument();

        await userEvent.selectOptions(
            screen.getByDisplayValue(/all statuses/i),
            'degraded'
        );

        expect(
            screen.getByText(/tefca readiness assessment/i)
        ).toBeInTheDocument();
        expect(
            screen.queryByText(/pd anomaly deep dive/i)
        ).not.toBeInTheDocument();

        await userEvent.selectOptions(
            screen.getByDisplayValue(/production/i),
            'sandbox'
        );

        expect(
            screen.getByText(/certificate renewal forecast/i)
        ).toBeInTheDocument();
    });

    it('opens report detail when viewing a card', async () => {
        render(<ReportsPage />);

        await userEvent.selectOptions(
            screen.getByDisplayValue(/all environments/i),
            'prod'
        );

        const viewButtons = screen.getAllByRole('button', { name: /view/i });
        await userEvent.click(viewButtons[0]);

        expect(screen.getByText(/executive summary/i)).toBeInTheDocument();
    });
});
