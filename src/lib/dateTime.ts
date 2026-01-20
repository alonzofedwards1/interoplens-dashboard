export const formatTimestamp = (
    value?: string | null,
    timeZone?: string,
    fallback = '—'
) => {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;
    return date.toLocaleString(undefined, timeZone ? { timeZone } : undefined);
};
