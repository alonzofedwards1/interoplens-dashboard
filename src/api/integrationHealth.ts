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
        console.warn('certificateHealth missing from API response');
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

    console.log('Mapped Certificate Health:', mapped);

    return mapped;
}

export async function fetchIntegrationHealth(): Promise<IntegrationHealthResponse> {
    const res = await requestJson<any>(
        `${API_BASE}/api/health/integrations`
    );


    console.log('Integration Health API RAW:', res);

    const certificateHealth = mapCertificateHealth(
        res?.certificateHealth
    );


    const isAllZero =
        certificateHealth.expired === 0 &&
        certificateHealth.expiringSoon === 0 &&
        certificateHealth.valid === 0;

    if (isAllZero) {
        console.warn(
            'Certificate health returned all zeros — backend may not be using certificates table'
        );
    }

    return {
        totalExecutions: res?.totalExecutions ?? 0,
        successRate: res?.successRate ?? 0,
        affectedPartners: res?.affectedPartners ?? 0,
        certificateHealth,
    };
}