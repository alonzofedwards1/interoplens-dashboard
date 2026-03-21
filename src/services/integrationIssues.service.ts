import { PdExecutionHealthSummary } from "../types/pdExecutions";
import { fetchPdExecutions } from "./pdExecutions.service";

type FetchParams = Record<string, string | number | boolean | undefined>;

export const fetchExecutionHealthSummary = async (
    params?: FetchParams
): Promise<PdExecutionHealthSummary> => {
    const executions = await fetchPdExecutions(params);

    const summary: PdExecutionHealthSummary = {
        total: 0,
        success: 0,
        failure: 0,
        partial: 0,
        byRootCause: {},
    };

    for (const execution of executions) {
        summary.total += 1;

        if (execution.outcome === "success") {
            summary.success += 1;
        }

        if (execution.outcome === "failure") {
            summary.failure += 1;

            const rootCause = execution.rootCause ?? "Unspecified";

            summary.byRootCause[rootCause] =
                (summary.byRootCause[rootCause] ?? 0) + 1;
        }

        if (execution.outcome === "partial") {
            summary.partial = (summary.partial ?? 0) + 1;
        }
    }

    // Clean up optional field
    if ((summary.partial ?? 0) === 0) {
        delete summary.partial;
    }

    return summary;
};