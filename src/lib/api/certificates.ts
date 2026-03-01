import type { CertificateDetails } from '../../types';
import { requestJson } from './request';

const BASE = '/api/transport';

export async function fetchCertificateDetails(
    transactionId: string
): Promise<CertificateDetails> {
    return requestJson<CertificateDetails>(
        `${BASE}/${encodeURIComponent(transactionId)}/certificate`
    );
}
