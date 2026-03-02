import { useEffect, useState } from 'react';

import { fetchCertificateDetails } from '../lib/api/certificates';
import type { CertificateDetails } from '../types';

const toDisplayDate = (isoDate: string | null): string | null => {
    if (!isoDate) return null;

    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
        return isoDate;
    }

    return date.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
};

const mapToDisplay = (details: CertificateDetails): CertificateDetails => ({
    ...details,
    notBefore: toDisplayDate(details.notBefore),
    notAfter: toDisplayDate(details.notAfter),
});

export function useCertificateDetails(transactionId: string | null) {
    const [data, setData] = useState<CertificateDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!transactionId) {
            setData(null);
            setLoading(false);
            setError(null);
            return;
        }

        let mounted = true;

        setLoading(true);
        setError(null);

        fetchCertificateDetails(transactionId)
            .then(response => {
                if (mounted) {
                    setData(mapToDisplay(response));
                }
            })
            .catch(err => {
                if (mounted) {
                    setData(null);
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Unable to load certificate details'
                    );
                }
            })
            .finally(() => {
                if (mounted) {
                    setLoading(false);
                }
            });

        return () => {
            mounted = false;
        };
    }, [transactionId]);

    return { data, loading, error };
}
