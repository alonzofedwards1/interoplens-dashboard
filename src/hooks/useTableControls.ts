import React from 'react';

import { SortOrder } from '../components/table/types';

interface UseTableControlsOptions<F extends object, S extends string> {
    tableKey: string;
    defaultFilters: F;
    defaultLimit?: number;
    defaultOffset?: number;
    parseFilters?: (params: URLSearchParams, defaults: F) => F;
    serializeFilters?: (filters: F) => URLSearchParams;
    allowedSortColumns?: readonly S[];
}

interface TableControlsResult<F extends object, S extends string> {
    filters: F;
    sortBy: S | null;
    sortOrder: SortOrder | null;
    limit: number;
    offset: number;
    setFilter: <K extends keyof F>(key: K, value: F[K]) => void;
    setSort: (column: S) => void;
    setLimit: (nextLimit: number) => void;
    setOffset: (nextOffset: number) => void;
    resetFilters: () => void;
    resetAll: () => void;
    syncWithUrl: () => void;
    buildQueryString: () => string;
}

interface ParsedState<F extends object, S extends string> {
    filters: F;
    sortBy: S | null;
    sortOrder: SortOrder | null;
    limit: number;
    offset: number;
}

const isSortOrder = (value: string | null): value is SortOrder =>
    value === 'asc' || value === 'desc';

const defaultSerializeFilters = <F extends object>(filters: F): URLSearchParams => {
    const params = new URLSearchParams();

    Object.entries(filters as Record<string, unknown>).forEach(([key, value]) => {
        if (value == null || value === '') {
            return;
        }

        if (typeof value === 'object') {
            const rangeLike = value as { min?: string | number; max?: string | number };
            const dateLike = value as { start?: string; end?: string };

            if (rangeLike.min != null && rangeLike.min !== '') {
                params.set(`${key}Min`, String(rangeLike.min));
            }
            if (rangeLike.max != null && rangeLike.max !== '') {
                params.set(`${key}Max`, String(rangeLike.max));
            }
            if (dateLike.start) {
                params.set(`${key}Start`, dateLike.start);
            }
            if (dateLike.end) {
                params.set(`${key}End`, dateLike.end);
            }
            return;
        }

        params.set(key, String(value));
    });

    return params;
};

const defaultParseFilters = <F extends object>(params: URLSearchParams, defaults: F): F => {
    const nextFilters = { ...defaults };

    (Object.keys(defaults as Record<string, unknown>) as Array<keyof F>).forEach(key => {
        const defaultValue = defaults[key];

        if (defaultValue && typeof defaultValue === 'object') {
            const min = params.get(`${String(key)}Min`);
            const max = params.get(`${String(key)}Max`);
            const start = params.get(`${String(key)}Start`);
            const end = params.get(`${String(key)}End`);

            if (min != null || max != null || start != null || end != null) {
                if ('start' in defaultValue || 'end' in defaultValue) {
                    nextFilters[key] = {
                        start: start ?? undefined,
                        end: end ?? undefined,
                    } as F[keyof F];
                    return;
                }

                const minValue =
                    typeof (defaultValue as { min?: unknown }).min === 'number' && min != null
                        ? Number(min)
                        : min ?? undefined;
                const maxValue =
                    typeof (defaultValue as { max?: unknown }).max === 'number' && max != null
                        ? Number(max)
                        : max ?? undefined;

                nextFilters[key] = {
                    min: minValue,
                    max: maxValue,
                } as F[keyof F];
            }
            return;
        }

        const raw = params.get(String(key));
        if (raw == null) {
            return;
        }

        if (typeof defaultValue === 'number') {
            const parsed = Number(raw);
            if (!Number.isNaN(parsed)) {
                nextFilters[key] = parsed as F[keyof F];
            }
            return;
        }

        if (typeof defaultValue === 'boolean') {
            nextFilters[key] = (raw === 'true') as F[keyof F];
            return;
        }

        nextFilters[key] = raw as F[keyof F];
    });

    return nextFilters;
};

export function useTableControls<F extends object, S extends string>(
    options: UseTableControlsOptions<F, S>
): TableControlsResult<F, S> {
    const {
        tableKey,
        defaultFilters,
        defaultLimit = 25,
        defaultOffset = 0,
        parseFilters = defaultParseFilters,
        serializeFilters = defaultSerializeFilters,
        allowedSortColumns,
    } = options;

    const parsedInitialState = React.useMemo<ParsedState<F, S>>(() => {
        const params = new URLSearchParams(window.location.search);
        const nextFilters = parseFilters(params, defaultFilters);

        const parsedLimit = Number(params.get('limit'));
        const parsedOffset = Number(params.get('offset'));
        const rawSortBy = params.get('sortBy');
        const rawSortOrder = params.get('sortOrder');

        const isAllowedSort = rawSortBy
            ? !allowedSortColumns || allowedSortColumns.includes(rawSortBy as S)
            : false;

        return {
            filters: nextFilters,
            sortBy: isAllowedSort ? (rawSortBy as S) : null,
            sortOrder: isSortOrder(rawSortOrder) ? rawSortOrder : null,
            limit: Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : defaultLimit,
            offset: Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : defaultOffset,
        };
    }, [allowedSortColumns, defaultFilters, defaultLimit, defaultOffset, parseFilters]);

    const [filters, setFilters] = React.useState<F>(parsedInitialState.filters);
    const [sortBy, setSortBy] = React.useState<S | null>(parsedInitialState.sortBy);
    const [sortOrder, setSortOrder] = React.useState<SortOrder | null>(parsedInitialState.sortOrder);
    const [limit, setLimitState] = React.useState(parsedInitialState.limit);
    const [offset, setOffsetState] = React.useState(parsedInitialState.offset);

    const buildQueryString = React.useCallback(() => {
        const params = serializeFilters(filters);

        if (sortBy && sortOrder) {
            params.set('sortBy', sortBy);
            params.set('sortOrder', sortOrder);
        }

        params.set('limit', String(limit));
        params.set('offset', String(offset));

        return params.toString();
    }, [filters, limit, offset, serializeFilters, sortBy, sortOrder]);

    const syncWithUrl = React.useCallback(() => {
        const queryString = buildQueryString();
        const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;
        window.history.pushState({ tableKey }, '', nextUrl);
    }, [buildQueryString, tableKey]);

    React.useEffect(() => {
        syncWithUrl();
    }, [syncWithUrl]);

    const setFilter = React.useCallback(<K extends keyof F>(key: K, value: F[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setOffsetState(0);
    }, []);

    const setSort = React.useCallback(
        (column: S) => {
            setOffsetState(0);

            if (sortBy !== column) {
                setSortBy(column);
                setSortOrder('asc');
                return;
            }

            if (sortOrder === 'asc') {
                setSortOrder('desc');
                return;
            }

            if (sortOrder === 'desc') {
                setSortBy(null);
                setSortOrder(null);
                return;
            }

            setSortOrder('asc');
        },
        [sortBy, sortOrder]
    );

    const setLimit = React.useCallback((nextLimit: number) => {
        setLimitState(nextLimit);
        setOffsetState(0);
    }, []);

    const setOffset = React.useCallback((nextOffset: number) => {
        setOffsetState(Math.max(0, nextOffset));
    }, []);

    const resetFilters = React.useCallback(() => {
        setFilters(defaultFilters);
        setOffsetState(0);
    }, [defaultFilters]);

    const resetAll = React.useCallback(() => {
        setFilters(defaultFilters);
        setSortBy(null);
        setSortOrder(null);
        setLimitState(defaultLimit);
        setOffsetState(defaultOffset);
    }, [defaultFilters, defaultLimit, defaultOffset]);

    return {
        filters,
        sortBy,
        sortOrder,
        limit,
        offset,
        setFilter,
        setSort,
        setLimit,
        setOffset,
        resetFilters,
        resetAll,
        syncWithUrl,
        buildQueryString,
    };
}
