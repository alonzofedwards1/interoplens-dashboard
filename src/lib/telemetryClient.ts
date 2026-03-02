import type { MessageEvent } from '../types/messages';
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

export interface MessageQueryParams {
    filters?: MessageFilterParams;
    sortBy?: MessageSortBy;
    sortOrder?: SortOrder;
    limit?: number;
    offset?: number;
}

export interface MessageEventsResponse {
    items: MessageEvent[];
    total: number;
}

const getAuthToken = () => {
    return localStorage.getItem('authToken') ?? localStorage.getItem('token') ?? '';
};

const appendDefined = (params: URLSearchParams, key: string, value: unknown) => {
    if (value == null || value === '') {
        return;
    }
    params.set(key, String(value));
};

export function buildMessageEventsQuery(params: MessageQueryParams = {}): string {
    const query = new URLSearchParams();

    appendDefined(query, 'startTime', params.filters?.startTime);
    appendDefined(query, 'endTime', params.filters?.endTime);
    appendDefined(query, 'organization', params.filters?.organization);
    appendDefined(query, 'transactionType', params.filters?.transactionType);
    appendDefined(query, 'status', params.filters?.status);
    appendDefined(query, 'environment', params.filters?.environment);
    appendDefined(query, 'search', params.filters?.search);
    appendDefined(query, 'source', params.filters?.source);
    appendDefined(query, 'responseStatus', params.filters?.responseStatus);
    appendDefined(query, 'daysUntilExpirationMin', params.filters?.daysUntilExpirationMin);
    appendDefined(query, 'daysUntilExpirationMax', params.filters?.daysUntilExpirationMax);
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
    const url = `/api/messages${query ? `?${query}` : ''}`;

    const token = getAuthToken();
    const res = await fetch(url, {
        credentials: 'include',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch message monitor (${res.status})`);
    }

    const data = (await res.json()) as unknown;

    if (Array.isArray(data)) {
        return {
            items: data as MessageEvent[],
            total: data.length,
        };
    }

    if (
        typeof data === 'object' &&
        data !== null &&
        'items' in data &&
        Array.isArray((data as { items: unknown }).items)
    ) {
        const typed = data as { items: MessageEvent[]; total?: number };
        return {
            items: typed.items,
            total: typeof typed.total === 'number' ? typed.total : typed.items.length,
        };
    }

    throw new Error('Unexpected messages response format');
}
