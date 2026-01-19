import { useEffect, useState } from 'react';
import {
    fetchIntegrationHealth,
    IntegrationHealthResponse,
} from '../api/integrationHealth';

export function useIntegrationHealth() {
    const [data, setData] = useState<IntegrationHealthResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        fetchIntegrationHealth()
            .then((res) => {
                if (mounted) setData(res);
            })
            .catch(() => {
                if (mounted) setError('Unable to load integration health');
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    return { data, loading, error };
}
