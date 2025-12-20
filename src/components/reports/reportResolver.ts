import { tefcaReadinessMock } from "./mocks/tefcaReadiness.mock";
import { tefcaSnapshotMock } from "./mocks/tefcaSnapshot.mock";
import type { ReportId } from "./reportTypes";

/**
 * Discriminated union of all report shapes
 */
export type Report = typeof tefcaReadinessMock | typeof tefcaSnapshotMock;

export const getReportById = (reportId: ReportId): Report | null => {
    switch (reportId) {
        case "tefca-readiness":
            return tefcaReadinessMock;

        case "tefca-snapshot":
            return tefcaSnapshotMock;

        default:
            return null;
    }
};
