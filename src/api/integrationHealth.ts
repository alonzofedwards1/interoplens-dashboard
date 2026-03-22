import { requestJson } from '../lib/api/request';
import { API_BASE } from '../lib/apiBase';

export interface CertificateHealth {
    expired: number;
    expiringSoon: number;
    valid: number;
}

export interface IntegrationHealthResponse {
    totalExecutions: number;
    successRate: number;
    certificateHealth: CertificateHealth;
    affectedPartners: number;
}

function mapCertificateHealth(raw: any): CertificateHealth {
    if (!raw) {
        return {
            expired: 0,
            expiringSoon: 0,
            valid: 0,
        };
    }

    const mapped = {
        expired: raw.expired ?? 0,
        expiringSoon:
            raw.expiringSoon ??
            raw.expiring_soon ??
            0,
        valid: raw.valid ?? 0,
    };

    return mapped;
}

export async function fetchIntegrationHealth(): Promise<IntegrationHealthResponse> {
    const res = await requestJson<any>(
        `${API_BASE}/api/health/integrations`
    );

    const certificateHealth = mapCertificateHealth(
        res?.certificateHealth
    );

    return {
        totalExecutions: res?.totalExecutions ?? 0,
        successRate: res?.successRate ?? 0,
        affectedPartners: res?.affectedPartners ?? 0,
        certificateHealth,
    };
}
