import type { MessageMonitorResponse, MessageMonitorRow } from '../types/messages';
import { SortOrder } from '../components/table/types';

export type MessageSortBy =
    | 'timestamp'
    | 'eventType'
    | 'status'
    | 'durationMs'
    | 'environment'
    | 'channelId';

export type MessageFilterParams = {
    startTime?: string;
    endTime?: string;
    organization?: string;
    transactionType?: string;
    status?: 'Success' | 'Error' | 'Warning';
    environment?: string;
    search?: string;
    source?: 'transport' | 'telemetry';
    responseStatus?: number;
    daysUntilExpirationMin?: number;
    daysUntilExpirationMax?: number;
};

export interface MessageQueryParams extends MessageFilterParams {
    filters?: MessageFilterParams;
    sortBy?: MessageSortBy;
    sortOrder?: SortOrder;
    limit?: number;
    offset?: number;
}

export interface MessageEventsResponse extends MessageMonitorResponse {
    items: MessageMonitorRow[];
    total: number;
}

const appendDefined = (params: URLSearchParams, key: string, value: unknown) => {
    if (value == null || value === '') {
        return;
    }
    params.set(key, String(value));
};

const pickFilter = <K extends keyof MessageFilterParams>(
    params: MessageQueryParams,
    key: K
): MessageFilterParams[K] | undefined => {
    return params.filters?.[key] ?? params[key];
};

export function buildMessageEventsQuery(params: MessageQueryParams = {}): string {
    const query = new URLSearchParams();

    appendDefined(query, 'startTime', pickFilter(params, 'startTime'));
    appendDefined(query, 'endTime', pickFilter(params, 'endTime'));
    appendDefined(query, 'organization', pickFilter(params, 'organization'));
    appendDefined(query, 'transactionType', pickFilter(params, 'transactionType'));
    appendDefined(query, 'status', pickFilter(params, 'status'));
    appendDefined(query, 'environment', pickFilter(params, 'environment'));
    appendDefined(query, 'search', pickFilter(params, 'search'));
    appendDefined(query, 'source', pickFilter(params, 'source'));
    appendDefined(query, 'responseStatus', pickFilter(params, 'responseStatus'));
    appendDefined(query, 'daysUntilExpirationMin', pickFilter(params, 'daysUntilExpirationMin'));
    appendDefined(query, 'daysUntilExpirationMax', pickFilter(params, 'daysUntilExpirationMax'));
    appendDefined(query, 'sortBy', params.sortBy);
    appendDefined(query, 'sortOrder', params.sortOrder);
    appendDefined(query, 'limit', params.limit);
    appendDefined(query, 'offset', params.offset);

    return query.toString();
}

export async function fetchMessageEvents(
    params: MessageQueryParams = {}
): Promise<MessageEventsResponse> {
    const query = buildMessageEventsQuery(params);
    const url = `/api/message-monitor${query ? `?${query}` : ''}`;

    const res = await fetch(url, {
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch message monitor (${res.status})`);
    }

    const data = (await res.json()) as unknown;

    if (Array.isArray(data)) {
        return {
            items: data as MessageMonitorRow[],
            total: data.length,
            data: data as MessageMonitorRow[],
            pagination: {
                total: data.length,
                limit: params.limit ?? data.length,
                offset: params.offset ?? 0,
            },
        };
    }

    if (
        typeof data === 'object' &&
        data !== null &&
        'data' in data &&
        Array.isArray((data as { data: unknown }).data)
    ) {
        const typed = data as MessageMonitorResponse;
        return {
            items: typed.data,
            total: typed.pagination.total,
            data: typed.data,
            pagination: typed.pagination,
        };
    }

    if (
        typeof data === 'object' &&
        data !== null &&
        'items' in data &&
        Array.isArray((data as { items: unknown }).items)
    ) {
        const typed = data as { items: MessageMonitorRow[]; total?: number };
        return {
            items: typed.items,
            total: typeof typed.total === 'number' ? typed.total : typed.items.length,
            data: typed.items,
            pagination: {
                total: typeof typed.total === 'number' ? typed.total : typed.items.length,
                limit: params.limit ?? typed.items.length,
                offset: params.offset ?? 0,
            },
        };
    }

    throw new Error('Unexpected messages response format');
}

/**
 * Backward-compatible alias for legacy callers.
 */
export const fetchMessageMonitor = fetchMessageEvents;
