export type DashboardPreferences = {
    defaultLandingView: 'dashboard' | 'pd-executions' | 'findings';
    defaultDateRange: '24h' | '7d' | '30d';
    timeGrouping: 'hourly' | 'daily';
    persistFilters: boolean;
};

export type UiPreferences = {
    theme: 'light' | 'dark';
    density: 'comfortable' | 'compact';
};

export type UserPreferences = {
    timezone: string;
    dashboard: DashboardPreferences;
    ui: UiPreferences;
};

const STORAGE_KEY = 'userPreferences';

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
    timezone: 'UTC',
    dashboard: {
        defaultLandingView: 'dashboard',
        defaultDateRange: '24h',
        timeGrouping: 'hourly',
        persistFilters: true,
    },
    ui: {
        theme: 'light',
        density: 'comfortable',
    },
};

const readPreferences = (): UserPreferences | null => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as UserPreferences;
    } catch (error) {
        console.error('Failed to parse user preferences', error);
        return null;
    }
};

const writePreferences = (preferences: UserPreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
};

const mergePreferences = (
    current: UserPreferences,
    patch: Partial<UserPreferences>
): UserPreferences => ({
    ...current,
    ...patch,
    dashboard: {
        ...current.dashboard,
        ...(patch.dashboard ?? {}),
    },
    ui: {
        ...current.ui,
        ...(patch.ui ?? {}),
    },
});

/**
 * Dummy API for Phase 0:
 * GET /api/user/preferences
 */
export const fetchUserPreferences = async (): Promise<UserPreferences> => {
    const stored = readPreferences();
    if (!stored) {
        writePreferences(DEFAULT_USER_PREFERENCES);
        return DEFAULT_USER_PREFERENCES;
    }
    return mergePreferences(DEFAULT_USER_PREFERENCES, stored);
};

/**
 * Dummy API for Phase 0:
 * POST /api/user/preferences
 */
export const updateUserPreferences = async (
    patch: Partial<UserPreferences>
): Promise<UserPreferences> => {
    const stored = readPreferences() ?? DEFAULT_USER_PREFERENCES;
    const merged = mergePreferences(stored, patch);
    writePreferences(merged);
    return merged;
};
