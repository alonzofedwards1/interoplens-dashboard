import { useEffect, useState } from "react";
import { fetchExecutionHealthSummary } from "../../../services/pdExecutions.service";
import { PdExecutionHealthSummary } from "../../../types/pdExecutions";

export const useIntegrationIssues = () => {
    const [summary, setSummary] = useState<PdExecutionHealthSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                const data = await fetchExecutionHealthSummary();
                if (mounted) {
                    setSummary(data);
                    setError(null);
                }
            } catch (err) {
                if (mounted) {
                    setError(
                        err instanceof Error ? err.message : "Failed to load PD execution summary"
                    );
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => {
            mounted = false;
        };
    }, []);

    return { summary, loading, error };
};