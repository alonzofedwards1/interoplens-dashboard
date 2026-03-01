import type { CertificateDetails } from '../../types';
import { requestJson } from './request';
import { API_BASE } from '../apiBase';

const BASE = `${API_BASE}/api/transport`;

export async function fetchCertificateDetails(
    transactionId: string
): Promise<CertificateDetails> {
    return requestJson<CertificateDetails>(
        `${BASE}/${encodeURIComponent(transactionId)}/certificate`
    );
}
