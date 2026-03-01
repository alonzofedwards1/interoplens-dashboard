import type { MessageMonitorResponse, MessageMonitorRow } from '../types/messages';

export type MessageFilterParams = {
    startTime?: string;
    endTime?: string;
    organization?: string;
    transactionType?: string;
    status?: 'Success' | 'Error' | 'Warning';
    environment?: string;
    search?: string;
    source?: 'transport' | 'telemetry';
    limit?: number;
    offset?: number;
};

const getAuthToken = () => {
    return localStorage.getItem('authToken') ?? localStorage.getItem('token') ?? '';
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const isMessageMonitorRow = (value: unknown): value is MessageMonitorRow => {
    if (!isRecord(value)) return false;

    return (
        typeof value.transaction_id === 'string' &&
        typeof value.channel === 'string' &&
        typeof value.response_status === 'string' &&
        typeof value.transport_timestamp === 'string'
    );
};

const parseMessageMonitorResponse = (value: unknown): MessageMonitorResponse => {
    if (!isRecord(value) || !Array.isArray(value.data) || !isRecord(value.pagination)) {
        throw new Error('Unexpected message monitor response format');
    }

    if (!value.data.every(isMessageMonitorRow)) {
        throw new Error('Unexpected message monitor row format');
    }

    const { total, limit, offset } = value.pagination;

    if (
        typeof total !== 'number' ||
        typeof limit !== 'number' ||
        typeof offset !== 'number'
    ) {
        throw new Error('Unexpected message monitor pagination format');
    }

    return {
        data: value.data,
        pagination: {
            total,
            limit,
            offset,
        },
    };
};

export async function fetchMessageMonitor(
    filters?: MessageFilterParams
): Promise<MessageMonitorResponse> {
    const params = new URLSearchParams();

    if (filters?.startTime) params.set('startTime', filters.startTime);
    if (filters?.endTime) params.set('endTime', filters.endTime);
    if (filters?.organization) params.set('organization', filters.organization);
    if (filters?.transactionType) params.set('transactionType', filters.transactionType);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.environment) params.set('environment', filters.environment);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.source) params.set('source', filters.source);
    if (typeof filters?.limit === 'number') params.set('limit', String(filters.limit));
    if (typeof filters?.offset === 'number') params.set('offset', String(filters.offset));

    const query = params.toString();
    const url = `/api/message-monitor${query ? `?${query}` : ''}`;

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

    return parseMessageMonitorResponse(await res.json());
}

export async function fetchMessageEvents(
    filters?: MessageFilterParams
): Promise<MessageMonitorRow[]> {
    const response = await fetchMessageMonitor(filters);
    return response.data;
}
