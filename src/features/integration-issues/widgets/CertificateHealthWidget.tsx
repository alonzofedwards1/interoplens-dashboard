interface CertificateHealthCounts {
    expired: number;
    expiringSoon: number;
    valid: number;
}

interface Props {
    data: CertificateHealthCounts;
    onViewDetails?: () => void;
}

const CertificateHealthWidget: React.FC<Props> = ({
                                                      data,
                                                      onViewDetails,
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

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-red-600">❌ Expired</span>
                    <span className="font-medium">{data.expired}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-yellow-600">⚠️ Expiring Soon</span>
                    <span className="font-medium">{data.expiringSoon}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-green-600">🟢 Valid</span>
                    <span className="font-medium">{data.valid}</span>
                </div>
            </div>

            <p className="text-xs text-gray-500">
                Expiring Soon = within 30 days
            </p>
        </div>
    );
};

export default CertificateHealthWidget;
