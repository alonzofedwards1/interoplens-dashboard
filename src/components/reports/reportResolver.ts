import { tefcaReadinessMock } from "./mocks/tefcaReadiness.mock";
import { tefcaSnapshotMock } from "./mocks/tefcaSnapshot.mock";

/**
 * Discriminated union of all report shapes
 */
export type Report =
    | typeof tefcaReadinessMock
    | typeof tefcaSnapshotMock;

export type ReportId = Report["reportId"];

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
