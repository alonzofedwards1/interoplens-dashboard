export interface CertificateDetails {
    subject: string;
    issuer: string;
    thumbprint: string;
    notBefore: string;
    notAfter: string;
    status: 'Valid' | 'Expiring Soon' | 'Expired';
    detectedVia: 'Live Transaction' | 'Trust Metadata';
}
