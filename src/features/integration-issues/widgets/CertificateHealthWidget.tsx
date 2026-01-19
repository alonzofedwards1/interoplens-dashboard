import { CertificateHealthSummary } from "../../../types/integrationHealth";

interface Props {
    certificateHealth?: CertificateHealthSummary;
    errorMessage?: string | null;
    onViewDetails?: () => void;
}

const CertificateHealthWidget: React.FC<Props> = ({
    certificateHealth,
    errorMessage,
    onViewDetails,
}) => {
    const expiredDisplay =
        certificateHealth?.expired === null ||
        certificateHealth?.expired === undefined
            ? "Unknown"
            : certificateHealth.expired;
    const expiringSoonDisplay = certificateHealth?.expiringSoon ?? 0;
    const validDisplay =
        certificateHealth?.valid === null
            ? "Not yet inventoried"
            : certificateHealth?.valid ?? "Unknown";

    return (
        <div className="rounded-lg border bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">
                    🔐 Certificate Health
                </h3>

                {onViewDetails && (
                    <button
                        onClick={onViewDetails}
                        className="text-xs text-blue-600 hover:underline"
                    >
                        View details
                    </button>
                )}
            </div>

            {errorMessage ? (
                <p className="text-sm text-red-600">{errorMessage}</p>
            ) : !certificateHealth ? (
                <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                </div>
            ) : (
                <>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-red-600">
                                ❌ Expired (execution-backed)
                            </span>
                            <span className="font-medium">{expiredDisplay}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-yellow-600">
                                ⚠️ Expiring Soon
                            </span>
                            <span className="font-medium">{expiringSoonDisplay}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-green-600">🟢 Valid</span>
                            <span className="font-medium">{validDisplay}</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CertificateHealthWidget;
