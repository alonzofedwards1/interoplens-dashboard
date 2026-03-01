import type { MessageMonitorRow } from '@/types/messages';
import type { CertificateDetails } from '@/types/certificates';

export function mapRowToCertificateDetails(
    row: MessageMonitorRow
): CertificateDetails {
    return {
        subject: row.subject_cn,
        issuer: row.issuer_cn,
        thumbprint: row.fingerprint_sha1,
        notBefore: row.not_before,
        notAfter: row.not_after,
        status: row.certificate_status ?? 'Valid',
        detectedVia: row.detected_via,
    };
}
