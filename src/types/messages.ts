export type CertificateStatus = 'Valid' | 'Expired' | 'Expiring Soon';

export interface MessageMonitorRow {
    transaction_id: string;
    channel: string;
    response_status: string;
    transport_timestamp: string;
    endpoint_id: string | null;
    host: string | null;
    port: number | null;
    scheme: string | null;
    cert_id: string | null;
    subject_cn: string | null;
    issuer_cn: string | null;
    fingerprint_sha1: string | null;
    not_before: string | null;
    not_after: string | null;
    first_seen_at: string | null;
    last_seen_at: string | null;
    is_self_signed: boolean | null;
    days_until_expiration: number | null;
    certificate_status: CertificateStatus | null;
    cert_age_years: number | null;
    detected_via: string | null;
}

export interface MessageMonitorPagination {
    total: number;
    limit: number;
    offset: number;
}

export interface MessageMonitorResponse {
    data: MessageMonitorRow[];
    pagination: MessageMonitorPagination;
}
