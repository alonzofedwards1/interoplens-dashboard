import type { MessageMonitorRow } from '../../../types/messages';

export interface DerivedCertificateHealth {
    expired: number;
    expiringSoon: number;
    valid: number;
}

export function deriveCertificateHealth(rows: MessageMonitorRow[]): DerivedCertificateHealth {
    return rows.reduce<DerivedCertificateHealth>(
        (acc, row) => {
            if (row.certificate_status === 'Expired') {
                acc.expired += 1;
            } else if (row.certificate_status === 'Expiring Soon') {
                acc.expiringSoon += 1;
            } else if (row.certificate_status === 'Valid') {
                acc.valid += 1;
            }
            return acc;
        },
        {
            expired: 0,
            expiringSoon: 0,
            valid: 0,
        }
    );
}
