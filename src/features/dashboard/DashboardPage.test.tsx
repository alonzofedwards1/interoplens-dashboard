import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DashboardPage from './DashboardPage';
const mockNavigate = jest.fn();

jest.mock(
    'react-router-dom',
    () => ({
        __esModule: true,
        useNavigate: () => mockNavigate,
    }),
    { virtual: true }
);

jest.mock('../../components/Sidebar', () => () => <div data-testid="sidebar" />);
jest.mock('../../components/Topbar', () => () => <div data-testid="topbar" />);
jest.mock('../../components/BarChart', () => () => <div data-testid="bar-chart" />);
jest.mock('../../components/PieChart', () => () => <div data-testid="pie-chart" />);
jest.mock('../../components/Filters', () => () => <div data-testid="filters" />);
jest.mock('../../components/FindingsTable', () => () => <div data-testid="findings-table" />);
jest.mock('../../components/ExampleFindings', () => () => <div data-testid="example-findings" />);
jest.mock('../../lib/ServerDataContext', () => ({
    useServerData: () => ({
        findings: require('../findings/data/findings.data').findingsData,
        pdExecutions: require('../pd-executions/data/pdExecutions.data').pdExecutionsData,
        committeeQueue: require('../committee/data/committeeQueue.data').committeeQueueData,
        loading: false,
        error: undefined,
        refresh: jest.fn(),
    }),
}));

const renderDashboard = () =>
    render(<DashboardPage role="admin" onLogout={() => undefined} />);

describe('DashboardPage', () => {
    it('surfaces operational insights derived from findings and PD telemetry', () => {
        renderDashboard();

        expect(
            screen.getByRole('heading', { name: /operational insights/i })
        ).toBeInTheDocument();
        expect(screen.getByText(/compliance coverage/i)).toBeInTheDocument();
        expect(screen.getByText(/production focus/i)).toBeInTheDocument();
        expect(screen.getByText(/pd execution health/i)).toBeInTheDocument();
        expect(screen.getByText(/errors observed/)).toBeInTheDocument();
    });

    it('navigates when clicking a summary card', async () => {
        renderDashboard();

        const pdCard = screen.getByRole('button', { name: /total pd executions/i });
        await userEvent.click(pdCard);

        expect(mockNavigate).toHaveBeenCalledWith('/telemetry');
    });
});
