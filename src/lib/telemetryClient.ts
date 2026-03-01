import type { MessageEvent } from '../types/messages';

export type MessageFilterParams = {
    startTime?: string;
    endTime?: string;
    organization?: string;
    transactionType?: string;
    status?: 'Success' | 'Error' | 'Warning';
    environment?: string;
    search?: string;
    source?: 'transport' | 'telemetry';
};

const getAuthToken = () => {
    return localStorage.getItem('authToken') ?? localStorage.getItem('token') ?? '';
};

export async function fetchMessageEvents(
    filters?: MessageFilterParams
): Promise<MessageEvent[]> {
    const params = new URLSearchParams();

    if (filters?.startTime) params.set('startTime', filters.startTime);
    if (filters?.endTime) params.set('endTime', filters.endTime);
    if (filters?.organization) params.set('organization', filters.organization);
    if (filters?.transactionType) params.set('transactionType', filters.transactionType);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.environment) params.set('environment', filters.environment);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.source) params.set('source', filters.source);

    const query = params.toString();
    const url = `/api/messages${query ? `?${query}` : ''}`;

    const token = getAuthToken();
    const res = await fetch(url, {
        credentials: 'include',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch messages (${res.status})`);
    }

    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) {
        throw new Error('Unexpected messages response format');
    }

    return data as MessageEvent[];
}
