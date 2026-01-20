import { useCallback, useEffect, useState } from 'react';

import {
    DEFAULT_USER_PREFERENCES,
    DashboardPreferences,
    fetchUserPreferences,
    UiPreferences,
    updateUserPreferences,
    UserPreferences,
} from './api/userPreferences';

type UseUserPreferencesState = {
    preferences: UserPreferences;
    loading: boolean;
    error: string | null;
};

export const useUserPreferences = () => {
    const [state, setState] = useState<UseUserPreferencesState>({
        preferences: DEFAULT_USER_PREFERENCES,
        loading: true,
        error: null,
    });

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            try {
                const preferences = await fetchUserPreferences();
                if (isMounted) {
                    setState({ preferences, loading: false, error: null });
                }
            } catch (error) {
                if (isMounted) {
                    setState({
                        preferences: DEFAULT_USER_PREFERENCES,
                        loading: false,
                        error:
                            error instanceof Error
                                ? error.message
                                : 'Unable to load preferences.',
                    });
                }
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, []);

    const updatePreferences = useCallback(
        async (patch: Partial<UserPreferences>) => {
            setState(prev => ({
                ...prev,
                preferences: {
                    ...prev.preferences,
                    ...patch,
                    dashboard: {
                        ...prev.preferences.dashboard,
                        ...(patch.dashboard ?? {}),
                    },
                    ui: {
                        ...prev.preferences.ui,
                        ...(patch.ui ?? {}),
                    },
                },
            }));

            try {
                const preferences = await updateUserPreferences(patch);
                setState(prev => ({
                    ...prev,
                    preferences,
                    error: null,
                }));
            } catch (error) {
                setState(prev => ({
                    ...prev,
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Unable to update preferences.',
                }));
            }
        },
        []
    );

    const setTimezone = useCallback(
        async (timezone: string) => {
            await updatePreferences({ timezone });
        },
        [updatePreferences]
    );

    const setDashboardPreferences = useCallback(
        async (dashboard: DashboardPreferences) => {
            await updatePreferences({ dashboard });
        },
        [updatePreferences]
    );

    const setUiPreferences = useCallback(
        async (ui: UiPreferences) => {
            await updatePreferences({ ui });
        },
        [updatePreferences]
    );

    return {
        preferences: state.preferences,
        loading: state.loading,
        error: state.error,
        setTimezone,
        setDashboardPreferences,
        setUiPreferences,
        updatePreferences,
    };
};
