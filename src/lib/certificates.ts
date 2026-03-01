import { Finding } from '../types/findings';
import { PdExecution } from '../types/pdExecutions';
import type { CertificateStatus } from '../types/certificates';

const normalizeCertificateStatus = (
    value?: string | null
): CertificateStatus | undefined => {
    if (!value) return undefined;

    const normalized = value.trim().toUpperCase();

    if (normalized === 'VALID') return 'Valid';
    if (normalized === 'EXPIRED') return 'Expired';
    if (normalized === 'EXPIRING_SOON' || normalized === 'EXPIRING SOON') {
        return 'Expiring Soon';
    }

    return undefined;
};

const readExecutionField = <T,>(
    exec: PdExecution | undefined,
    camelKey: keyof PdExecution,
    snakeKey: string
): T | undefined => {
    if (!exec) return undefined;
    const candidate = (exec as Record<string, unknown>)[camelKey as string];
    if (candidate !== undefined && candidate !== null) {
        return candidate as T;
    }
    const snakeCandidate = (exec as Record<string, unknown>)[snakeKey];
    return snakeCandidate as T | undefined;
};

export const getExecutionCertificateDetails = (exec?: PdExecution) => {
    const rawStatus = readExecutionField<string>(
        exec,
        'certStatus',
        'cert_status'
    );
    return {
        status: normalizeCertificateStatus(rawStatus),
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
        rootCause: readExecutionField<string>(exec, 'rootCause', 'root_cause'),
        httpStatus: readExecutionField<number>(exec, 'httpStatus', 'http_status'),
    };
};

export const getCertificateStatusBadge = (status?: CertificateStatus) => {
    switch (status) {
        case 'Valid':
            return {
                label: 'Valid',
                icon: '✅',
                className: 'bg-green-100 text-green-800',
                tooltip: 'Certificate validated',
            };
        case 'Expiring Soon':
            return {
                label: 'Expiring Soon',
                icon: '⚠️',
                className: 'bg-yellow-100 text-yellow-800',
                tooltip: 'Certificate expiring soon',
            };
        case 'Expired':
            return {
                label: 'Expired',
                icon: '❌',
                className: 'bg-red-100 text-red-800',
                tooltip: 'Certificate expired — caused TLS failure',
            };
        default:
            return {
                label: '—',
                icon: '',
                className: 'bg-gray-100 text-gray-600',
                tooltip: 'Certificate status unavailable',
            };
    }
};

export const getCertificateStatusDescription = (status?: CertificateStatus) => {
    switch (status) {
        case 'Valid':
            return 'Transport certificate validated successfully during this transaction.';
        case 'Expiring Soon':
            return 'Transport certificate will expire soon. Renewal is recommended to prevent outages.';
        case 'Expired':
            return 'Transport certificate was expired at the time of execution, causing the transaction to fail.';
        default:
            return 'Certificate status was not reported for this transaction.';
    }
};

const isCertificateRelatedText = (value?: string | null) => {
    if (!value) return false;
    const normalized = value.toLowerCase();
    return normalized.includes('cert') || normalized.includes('certificate');
};

export const buildCertificateFindingCopy = (
    finding: Finding,
    exec?: PdExecution
) => {
    const details = getExecutionCertificateDetails(exec);
    const rootCause = details.rootCause?.toUpperCase();
    const failureStage = details.failureStage?.toUpperCase();
    const hasCertificateSignal =
        Boolean(details.status) ||
        rootCause?.includes('CERT') ||
        failureStage?.includes('TLS') ||
        failureStage?.includes('CERT') ||
        isCertificateRelatedText(finding.summary) ||
        isCertificateRelatedText(finding.technicalDetail) ||
        isCertificateRelatedText(finding.category) ||
        isCertificateRelatedText(finding.type);

    if (!hasCertificateSignal) return null;

    const status = details.status;
    const isExpired =
        status === 'Expired' || rootCause === 'CERT_EXPIRED';
    const isExpiringSoon =
        status === 'Expiring Soon' || rootCause === 'CERT_EXPIRING_SOON';

    if (isExpired) {
        return {
            summary:
                'This transaction failed because the security certificate used to connect to the partner system has expired.',
            why: 'Expired certificates prevent secure connections and will block patient discovery requests until renewed.',
            action:
                'Renew the certificate with the partner organization and redeploy the endpoint configuration.',
            thumbprint: details.thumbprint,
        };
    }

    if (isExpiringSoon) {
        return {
            summary:
                'The security certificate used for the secure connection will expire soon.',
            why: 'Certificates approaching expiration can interrupt secure connections and lead to transaction failures if not renewed.',
            action:
                'Coordinate renewal with the partner organization and update the endpoint configuration before the expiration date.',
            thumbprint: details.thumbprint,
        };
    }

    if (status === 'Valid') {
        return {
            summary:
                'The security certificate validated successfully for this transaction.',
            why: 'Maintaining valid certificates keeps secure connections trusted and available.',
            action: 'No action is required at this time.',
            thumbprint: details.thumbprint,
        };
    }

    return {
        summary:
            'This transaction encountered a security certificate issue when connecting to the partner system.',
        why: 'Certificate issues prevent secure connections and can interrupt patient discovery requests.',
        action:
            'Confirm the partner system certificate status and update the endpoint configuration if needed.',
        thumbprint: details.thumbprint,
    };
};
