import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, within } from '@testing-library/react';

import Settings from './SettingsPage';

jest.mock(
    'react-router-dom',
    () => ({
        MemoryRouter: ({ children }: { children: React.ReactNode }) => (
            <div>{children}</div>
        ),
        Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    }),
    { virtual: true }
);

describe('SettingsPage user management', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    const renderSettings = () =>
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

    test('shows read-only user directory with role counts', async () => {
        renderSettings();

        expect(await screen.findByText(/Interoplens Admin/)).toBeInTheDocument();
        expect(screen.getByText(/Analyst User/)).toBeInTheDocument();

        const directory = within(screen.getByText(/Directory/).closest('.card-body')!);
        expect(directory.getByText(/Admin/)).toBeInTheDocument();
        expect(directory.getByText(/Analyst/)).toBeInTheDocument();
    });

    test('disables invitations with a phase notice', async () => {
        renderSettings();

        const addUserButton = await screen.findByRole('button', {
            name: /add user/i,
        });
        expect(addUserButton).toBeDisabled();
        expect(addUserButton).toHaveAttribute(
            'title',
            'User invitations available in Phase 1'
        );
    });
});
