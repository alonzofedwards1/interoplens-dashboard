import React from 'react';
import { act, render, waitFor } from '@testing-library/react';

import { SessionProvider } from './SessionContext';
import { useUserPreference } from './userPreferences';
import type { AuthSession } from './authClient';

describe('useUserPreference', () => {
    const session: AuthSession = {
        id: 'user-123',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'admin',
        token: 'token',
        issuedAt: Date.now(),
    };

    const renderWithSession = (ui: React.ReactElement) =>
        render(<SessionProvider session={session}>{ui}</SessionProvider>);

    beforeEach(() => {
        localStorage.clear();
    });

    it('syncs preference updates from storage events for the active user', async () => {
        const onValue = jest.fn();

        localStorage.setItem(
            'userPreferences',
            JSON.stringify({
                [session.id]: {
                    'findings.dashboard.table': {
                        query: '',
                        sortKey: 'detectedAt',
                        sortDirection: 'desc',
                    },
                },
            })
        );

        const TestComponent: React.FC = () => {
            const [prefs] = useUserPreference('findings.dashboard.table', {
                query: '',
                sortKey: 'detectedAt',
                sortDirection: 'desc' as const,
            });

            React.useEffect(() => {
                onValue(prefs.sortDirection);
            }, [prefs.sortDirection]);

            return null;
        };

        renderWithSession(<TestComponent />);

        await waitFor(() => expect(onValue).toHaveBeenCalledWith('desc'));

        const updatedStore = {
            [session.id]: {
                'findings.dashboard.table': {
                    query: 'acme',
                    sortKey: 'severity',
                    sortDirection: 'asc' as const,
                },
            },
        };

        await act(async () => {
            localStorage.setItem('userPreferences', JSON.stringify(updatedStore));

            window.dispatchEvent(
                new StorageEvent('storage', {
                    key: 'userPreferences',
                    newValue: JSON.stringify(updatedStore),
                    storageArea: localStorage,
                })
            );
        });

        await waitFor(() => expect(onValue).toHaveBeenCalledWith('asc'));
    });
});
