import React from 'react';
import { act, render, waitFor } from '@testing-library/react';

import { AuthProvider } from '../context/AuthContext';
import { useUserPreference } from './userPreferences';

jest.mock('../context/AuthContext', () => {
    const actual = jest.requireActual('../context/AuthContext');
    return {
        ...actual,
        useAuth: () => ({
            user: { userId: 42 },
            login: jest.fn(),
            logout: jest.fn(),
            refreshUser: jest.fn(),
            loading: false,
        }),
        AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    };
});

describe('useUserPreference', () => {
    const renderWithAuth = (ui: React.ReactElement) => render(<AuthProvider>{ui}</AuthProvider>);

    beforeEach(() => {
        localStorage.clear();
    });

    it('syncs preference updates from storage events for the active user', async () => {
        const onValue = jest.fn();

        localStorage.setItem(
            'userPreferences',
            JSON.stringify({
                '42': {
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

        renderWithAuth(<TestComponent />);

        await waitFor(() => expect(onValue).toHaveBeenCalledWith('desc'));

        const updatedStore = {
            '42': {
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
