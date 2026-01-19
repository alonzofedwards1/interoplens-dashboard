import { CertificateEvidence } from "../../../types/integrationHealth";

interface Props {
    cert: CertificateEvidence | null;
    onClose: () => void;
}

const CertInspectorModal: React.FC<Props> = ({ cert, onClose }) => {
    const statusLabel = cert ? "Expired" : "Unknown";
    const statusColor = cert ? "text-red-600" : "text-gray-500";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        🔐 Certificate Inspector
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                <p className="text-xs text-gray-500">
                    Certificate Evidence (Observed in Live Traffic)
                </p>

                <div className="space-y-2 text-sm">
                    <div>
                        <span className="font-medium">Status: </span>
                        <span className={statusColor}>{statusLabel}</span>
                    </div>

                    <div>
                        <span className="font-medium">Thumbprint: </span>
                        <code className="text-xs bg-gray-100 px-1 rounded">
                            {cert?.thumbprint ?? "Unknown"}
                        </code>
                    </div>

                    <div>
                        <span className="font-medium">Partner: </span>
                        {cert?.qhinName ?? "Unknown"}
                    </div>

                    <div>
                        <span className="font-medium">Direction: </span>
                        {cert?.direction ?? "Unknown"}
                    </div>

                    <div>
                        <span className="font-medium">Detected Via: </span>
                        Live Transaction
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertInspectorModal;
