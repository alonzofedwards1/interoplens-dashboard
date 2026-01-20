import { Finding } from '../types/findings';
import { PdExecution } from '../types/pdExecutions';

/* ============================
   Types
============================ */

export type CertificateStatus =
    | 'VALID'
    | 'EXPIRING_SOON'
    | 'EXPIRED'
    | 'UNKNOWN';

const CERT_STATUS_VALUES: CertificateStatus[] = [
    'VALID',
    'EXPIRING_SOON',
    'EXPIRED',
];

/* ============================
   Normalization
============================ */

const normalizeCertificateStatus = (
    value?: string | null
): CertificateStatus => {
    if (!value) return 'VALID'; // default assumption
    const normalized = value.toUpperCase();
    return CERT_STATUS_VALUES.includes(normalized as CertificateStatus)
        ? (normalized as CertificateStatus)
        : 'UNKNOWN';
};

/* ============================
   Safe field reader (camel/snake)
============================ */

const readExecutionField = <T,>(
    exec: PdExecution | undefined,
    camelKey: keyof PdExecution,
    snakeKey: string
): T | undefined => {
    if (!exec) return undefined;

    const camel = (exec as any)[camelKey];
    if (camel !== undefined && camel !== null) {
        return camel as T;
    }

    return (exec as any)[snakeKey] as T | undefined;
};

/* ============================
   Execution Certificate Details
============================ */

export const getExecutionCertificateDetails = (exec?: PdExecution) => {
    return {
        status: normalizeCertificateStatus(
            readExecutionField<string>(exec, 'certStatus', 'cert_status')
        ),
        thumbprint: readExecutionField<string>(
            exec,
            'certThumbprint',
            'cert_thumbprint'
        ),
        failureStage: readExecutionField<string>(
            exec,
            'failureStage',
            'failure_stage'
        ),
        rootCause: readExecutionField<string>(
            exec,
            'rootCause',
            'root_cause'
        ),
        httpStatus: readExecutionField<number>(
            exec,
            'httpStatus',
            'http_status'
        ),
    };
};

/* ============================
   UI Badge Helpers
============================ */

export const getCertificateStatusBadge = (status?: CertificateStatus) => {
    switch (status) {
        case 'VALID':
            return {
                label: 'VALID',
                icon: '✅',
                className: 'bg-green-100 text-green-800',
                tooltip: 'Certificate validated successfully',
            };
        case 'EXPIRING_SOON':
            return {
                label: 'EXPIRING SOON',
                icon: '⚠️',
                className: 'bg-yellow-100 text-yellow-800',
                tooltip: 'Certificate is nearing expiration',
            };
        case 'EXPIRED':
            return {
                label: 'EXPIRED',
                icon: '❌',
                className: 'bg-red-100 text-red-800',
                tooltip: 'Certificate expired and caused a TLS failure',
            };
        default:
            return {
                label: 'UNKNOWN',
                icon: '—',
                className: 'bg-gray-100 text-gray-600',
                tooltip: 'Certificate status unavailable',
            };
    }
};

export const getCertificateStatusDescription = (status?: CertificateStatus) => {
    switch (status) {
        case 'VALID':
            return 'The transport certificate validated successfully during this transaction.';
        case 'EXPIRING_SOON':
            return 'The transport certificate will expire soon and should be renewed.';
        case 'EXPIRED':
            return 'The transport certificate was expired at the time of execution, causing the transaction to fail.';
        default:
            return 'Certificate status was not reported for this transaction.';
    }
};

/* ============================
   Finding Copy Generator
============================ */

const isCertificateRelatedText = (value?: string | null) => {
    if (!value) return false;
    const normalized = value.toLowerCase();
    return (
        normalized.includes('cert') ||
        normalized.includes('certificate') ||
        normalized.includes('tls')
    );
};

export const buildCertificateFindingCopy = (
    finding: Finding,
    exec?: PdExecution
) => {
    const details = getExecutionCertificateDetails(exec);

    const rootCause = details.rootCause?.toUpperCase();
    const failureStage = details.failureStage?.toUpperCase();

    const hasCertificateSignal =
        Boolean(details.status && details.status !== 'VALID') ||
        rootCause?.includes('CERT') ||
        failureStage?.includes('TLS') ||
        isCertificateRelatedText(finding.summary) ||
        isCertificateRelatedText(finding.technicalDetail) ||
        isCertificateRelatedText(finding.category) ||
        isCertificateRelatedText(finding.type);

    if (!hasCertificateSignal) return null;

    if (
        details.status === 'EXPIRED' ||
        rootCause === 'CERT_EXPIRED'
    ) {
        return {
            summary:
                'This transaction failed because the security certificate used to connect to the partner system has expired.',
            why:
                'Expired certificates prevent secure TLS connections and will block patient discovery requests.',
            action:
                'Renew the certificate with the partner organization and redeploy the endpoint configuration.',
            thumbprint: details.thumbprint,
        };
    }

    if (
        details.status === 'EXPIRING_SOON' ||
        rootCause === 'CERT_EXPIRING_SOON'
    ) {
        return {
            summary:
                'The security certificate used for this connection will expire soon.',
            why:
                'Certificates nearing expiration can cause unexpected outages if not renewed in advance.',
            action:
                'Coordinate certificate renewal with the partner organization before expiration.',
            thumbprint: details.thumbprint,
        };
    }

    return {
        summary:
            'This transaction encountered a certificate-related issue during secure connection establishment.',
        why:
            'Certificate issues prevent secure communication between systems.',
        action:
            'Verify the partner system certificate and update endpoint configuration as needed.',
        thumbprint: details.thumbprint,
    };
};
