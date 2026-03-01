import type { MessageMonitorResponse, MessageMonitorRow } from '../types/messages';
import type { CertificateStatus } from '../types/certificates';
import { API_BASE } from './apiBase';

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

const toStringOrNull = (value: unknown): string | null => {
    if (typeof value === 'string') {
        const normalized = value.trim();
        return normalized.length ? normalized : null;
    }

    if (value === null || value === undefined) {
        return null;
    }

    return String(value);
};

const toRequiredString = (value: unknown): string => {
    if (typeof value === 'string') {
        return value;
    }
    if (value === null || value === undefined) {
        return '';
    }
    return String(value);
};

const toNumberOrNull = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim().length) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
};

const toBooleanOrNull = (value: unknown): boolean | null => {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'true') return true;
        if (normalized === 'false') return false;
    }

    return null;
};

const toCertificateStatusOrNull = (value: unknown): CertificateStatus | null => {
    if (value === 'Valid' || value === 'Expired' || value === 'Expiring Soon') {
        return value;
    }

    return null;
};

const normalizeMessageMonitorRow = (value: unknown): MessageMonitorRow | null => {
    if (!isRecord(value)) {
        return null;
    }

    const transactionId = toStringOrNull(value.transaction_id);

    if (!transactionId) {
        return null;
    }

    return {
        transaction_id: transactionId,
        channel: toRequiredString(value.channel),
        response_status: toRequiredString(value.response_status),
        transport_timestamp: toRequiredString(value.transport_timestamp),
        endpoint_id: toStringOrNull(value.endpoint_id),
        host: toStringOrNull(value.host),
        port: toNumberOrNull(value.port),
        scheme: toStringOrNull(value.scheme),
        cert_id: toStringOrNull(value.cert_id),
        subject_cn: toStringOrNull(value.subject_cn),
        issuer_cn: toStringOrNull(value.issuer_cn),
        fingerprint_sha1: toStringOrNull(value.fingerprint_sha1),
        not_before: toStringOrNull(value.not_before),
        not_after: toStringOrNull(value.not_after),
        first_seen_at: toStringOrNull(value.first_seen_at),
        last_seen_at: toStringOrNull(value.last_seen_at),
        is_self_signed: toBooleanOrNull(value.is_self_signed),
        days_until_expiration: toNumberOrNull(value.days_until_expiration),
        certificate_status: toCertificateStatusOrNull(value.certificate_status),
        cert_age_years: toNumberOrNull(value.cert_age_years),
        detected_via: toStringOrNull(value.detected_via),
    };
};

const toPaginationNumber = (value: unknown): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim().length) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return 0;
};

const parseMessageMonitorResponse = (value: unknown): MessageMonitorResponse => {
    if (Array.isArray(value)) {
        const rows = value
            .map(normalizeMessageMonitorRow)
            .filter((row): row is MessageMonitorRow => row !== null);

        return {
            data: rows,
            pagination: {
                total: rows.length,
                limit: rows.length,
                offset: 0,
            },
        };
    }

    if (!isRecord(value)) {
        return {
            data: [],
            pagination: {
                total: 0,
                limit: 0,
                offset: 0,
            },
        };
    }

    const dataCandidate = Array.isArray(value.data)
        ? value.data
        : Array.isArray(value.rows)
            ? value.rows
            : [];

    const paginationCandidate = isRecord(value.pagination)
        ? value.pagination
        : isRecord(value.meta)
            ? value.meta
            : {};

    const rows = dataCandidate
        .map(normalizeMessageMonitorRow)
        .filter((row): row is MessageMonitorRow => row !== null);

    const limit = toPaginationNumber(paginationCandidate.limit) || rows.length;
    const offset = toPaginationNumber(paginationCandidate.offset);
    const total = toPaginationNumber(paginationCandidate.total) || rows.length;

    return {
        data: rows,
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
    const url = `${API_BASE}/api/message-monitor${query ? `?${query}` : ''}`;

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
