import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '../context/AuthContext';

type PreferenceStore = Record<string, Record<string, unknown>>;

const STORAGE_KEY = 'userPreferences';

const readStore = (): PreferenceStore => {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return {};

    try {
        return JSON.parse(raw) as PreferenceStore;
    } catch (error) {
        console.error('Failed to parse user preferences', error);
        return {};
    }
};

const writeStore = (store: PreferenceStore) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

const getUserPreference = <T,>(userId: string, key: string, defaultValue: T): T => {
    const store = readStore();

    if (!store[userId]?.[key]) return defaultValue;

    return store[userId][key] as T;
};

const setUserPreference = <T,>(userId: string, key: string, value: T) => {
    const store = readStore();
    const currentUserPrefs = store[userId] || {};
    const updatedUserPrefs = { ...currentUserPrefs, [key]: value };

    writeStore({ ...store, [userId]: updatedUserPrefs });
};

/**
 * Stores the provided preference under the current user's session. Falls back
 * to in-memory state when no authenticated session is present.
 */
export const useUserPreference = <T,>(key: string, defaultValue: T) => {
    const { user } = useAuth();
    const userId = user?.username;

    const defaultRef = useRef(defaultValue);
    defaultRef.current = defaultValue;

    const [value, setValue] = useState<T>(() => {
        if (!userId) return defaultRef.current;

        return getUserPreference(userId, key, defaultRef.current);
    });

    useEffect(() => {
        if (!userId) {
            setValue(defaultRef.current);
            return;
        }

        setValue(getUserPreference(userId, key, defaultRef.current));
    }, [userId, key]);

    useEffect(() => {
        if (!userId) return undefined;

        const handleStorage = (event: StorageEvent) => {
            if (event.key === STORAGE_KEY) {
                setValue(getUserPreference(userId, key, defaultRef.current));
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [key, userId]);

    const update = useCallback<React.Dispatch<React.SetStateAction<T>>>(
        next => {
            setValue(prev => {
                const resolved =
                    typeof next === 'function'
                        ? (next as (current: T) => T)(prev)
                        : next;

                if (userId) {
                    setUserPreference(userId, key, resolved);
                }

                return resolved;
            });
        },
        [key, userId]
    );

    return [value, update] as const;
};

export const clearUserPreferences = () => localStorage.removeItem(STORAGE_KEY);
