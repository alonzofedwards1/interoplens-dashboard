import { webcrypto } from 'crypto';
import { TextEncoder } from 'util';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Settings from './SettingsPage';
import { resetUsers } from './data/usersStore';

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
    beforeAll(() => {
        Object.defineProperty(global, 'crypto', { value: webcrypto });
        Object.defineProperty(global, 'TextEncoder', { value: TextEncoder });
    });

    beforeEach(() => {
        localStorage.clear();
        resetUsers();
    });

    const renderSettings = (role: 'admin' | 'analyst' | 'committee') =>
        render(
            <MemoryRouter>
                <Settings role={role} />
            </MemoryRouter>
        );

    test('shows seeded users and invites a new analyst when admin adds them', async () => {
        renderSettings('admin');

        expect(screen.getByText(/Interoplens Admin/)).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText(/full name/i), 'Alex Analyst');
        await userEvent.type(screen.getByLabelText(/email/i), 'alex@example.com');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), ['analyst']);
        await userEvent.type(screen.getByLabelText(/temporary password/i), 'Temp1234!');

        await userEvent.click(screen.getByRole('button', { name: /invite user/i }));

        expect(
            await screen.findByText(/alex@example.com invited as Analyst/i)
        ).toBeInTheDocument();

        const directory = within(screen.getByText(/Directory/).closest('.card-body')!);
        expect(await directory.findByText(/alex@example.com/)).toBeInTheDocument();
        expect(directory.getByText(/Invited/)).toBeInTheDocument();
    });

    test('disables invitation controls for non-admin roles', async () => {
        renderSettings('analyst');

        expect(
            screen.getByText(/Only administrators can invite new users/i)
        ).toBeInTheDocument();

        expect(screen.getByLabelText(/email/i)).toBeDisabled();
        expect(screen.getByRole('button', { name: /invite user/i })).toBeDisabled();
    });
});
