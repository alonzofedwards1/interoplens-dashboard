export type CertificateStatus = 'Valid' | 'Expired' | 'Expiring Soon';

export interface CertificateDetails {
    subject: string | null;
    issuer: string | null;
    thumbprint: string | null;
    notBefore: string | null;
    notAfter: string | null;
    status: CertificateStatus;
    detectedVia: string | null;
}
