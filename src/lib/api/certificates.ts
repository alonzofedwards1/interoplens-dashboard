import { API_BASE_URL } from '../../config/api';
import type { CertificateDetails } from '../../types';
import { requestJson } from './request';

const BASE = `${API_BASE_URL}/api/transport`;

export async function fetchCertificateDetails(
    transactionId: string
): Promise<CertificateDetails> {
    return requestJson<CertificateDetails>(
        `${BASE}/${encodeURIComponent(transactionId)}/certificate`
    );
}
