import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Stores per-user preferences in localStorage, namespaced by userId.
 * If user is not logged in, preferences are not persisted.
 */
export const useUserPreference = <T,>(
    key: string,
    defaultValue: T
): [T, (value: T) => void] => {
    const { user } = useAuth();

    // User ID is now numeric
    const userId = user?.userId;

    const defaultRef = useRef(defaultValue);
    defaultRef.current = defaultValue;

    const storageKey = userId ? `user:${userId}:${key}` : null;

    const [value, setValue] = useState<T>(() => {
        if (!storageKey) return defaultValue;

        try {
            const raw = localStorage.getItem(storageKey);
            return raw !== null ? JSON.parse(raw) : defaultValue;
        } catch {
            return defaultValue;
        }
    });

    useEffect(() => {
        if (!storageKey) return;

        try {
            localStorage.setItem(storageKey, JSON.stringify(value));
        } catch {
            // ignore write errors
        }
    }, [storageKey, value]);

    // Reset when user changes
    useEffect(() => {
        if (!storageKey) {
            setValue(defaultRef.current);
            return;
        }

        try {
            const raw = localStorage.getItem(storageKey);
            setValue(raw !== null ? JSON.parse(raw) : defaultRef.current);
        } catch {
            setValue(defaultRef.current);
        }
    }, [storageKey]);

    return [value, setValue];
};
