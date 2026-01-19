export type CertificateHealthSummary = {
    expired: number | null;
    expiringSoon?: number | null;
    valid: number | null;
};

export type CertificateEvidence = {
    thumbprint?: string;
    qhinName?: string;
    direction?: 'inbound' | 'outbound';
};

export type IntegrationHealthResponse = {
    total: number;
    success: number;
    failure: number;
    partial?: number;
    failureRootCauses?: Record<string, number>;
    certificateHealth?: CertificateHealthSummary;
    certificateEvidence?: CertificateEvidence | null;
};
