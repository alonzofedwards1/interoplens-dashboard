import { IntegrationHealthResponse } from "../../../api/integrationHealth";
import { Link } from "react-router-dom";

interface Props {
    data?: IntegrationHealthResponse["certificateHealth"];
    errorMessage?: string | null;
    onViewDetails?: () => void;
    impactedLink?: string;
}

const CertificateHealthWidget: React.FC<Props> = ({
    data,
    errorMessage,
    onViewDetails,
    impactedLink,
}) => {
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
            ) : !data ? (
                <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                </div>
            ) : data.expired === 0 &&
              data.expiringSoon === 0 &&
              data.valid === 0 ? (
                <p className="text-sm text-gray-500">
                    No certificate health data available yet.
                </p>
            ) : (
                <>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-red-600">❌ Expired</span>
                            <span className="font-medium">{data.expired}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-yellow-600">
                                ⚠️ Expiring Soon
                            </span>
                            <span className="font-medium">
                                {data.expiringSoon}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-green-600">🟢 Valid</span>
                            <span className="font-medium">
                                {data.valid ?? "—"}
                            </span>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500">
                        Expiring Soon = within 30 days
                    </p>
                    {impactedLink && (
                        <Link
                            to={impactedLink}
                            className="text-xs text-blue-600 hover:underline"
                        >
                            View impacted executions
                        </Link>
                    )}
                </>
            )}
        </div>
    );
};

export default CertificateHealthWidget;
