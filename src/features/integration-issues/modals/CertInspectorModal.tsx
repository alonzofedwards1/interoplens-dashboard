interface CertificateDetails {
    subject: string;
    issuer: string;
    thumbprint: string;
    notBefore: string;
    notAfter: string;
    status: "Valid" | "Expiring Soon" | "Expired";
    detectedVia: "Live Transaction" | "Trust Metadata";
}

interface Props {
    cert: CertificateDetails;
    onClose: () => void;
}

const CertInspectorModal: React.FC<Props> = ({ cert, onClose }) => {
    const statusColor =
        cert.status === "Expired"
            ? "text-red-600"
            : cert.status === "Expiring Soon"
                ? "text-yellow-600"
                : "text-green-600";

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

                <div className="space-y-2 text-sm">
                    <div>
                        <span className="font-medium">Status: </span>
                        <span className={statusColor}>{cert.status}</span>
                    </div>

                    <div>
                        <span className="font-medium">Subject: </span>
                        {cert.subject}
                    </div>

                    <div>
                        <span className="font-medium">Issuer: </span>
                        {cert.issuer}
                    </div>

                    <div>
                        <span className="font-medium">Thumbprint: </span>
                        <code className="text-xs bg-gray-100 px-1 rounded">
                            {cert.thumbprint}
                        </code>
                    </div>

                    <div>
                        <span className="font-medium">Valid From: </span>
                        {cert.notBefore}
                    </div>

                    <div>
                        <span className="font-medium">Valid Until: </span>
                        {cert.notAfter}
                    </div>

                    <div>
                        <span className="font-medium">Detected Via: </span>
                        {cert.detectedVia}
                    </div>
                </div>

                <div className="pt-4 border-t text-xs text-gray-500">
                    Certificate validity is evaluated using the X.509{" "}
                    <code>NotAfter</code> field.
                </div>
            </div>
        </div>
    );
};

export default CertInspectorModal;
