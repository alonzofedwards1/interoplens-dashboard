import { useState } from "react";
import CertificateHealthWidget from "../widgets/CertificateHealthWidget";
import CertInspectorModal from "../modals/CertInspectorModal";

const ExecutiveSummary = () => {
    const [showCertModal, setShowCertModal] = useState(false);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Overall Health */}
                <div className="bg-white p-5 rounded shadow">
                    <h3 className="text-sm font-semibold text-gray-500">
                        Overall Health
                    </h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                        Stable
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                        92% successful transactions
                    </p>
                </div>

                {/* Card 2: Certificate Health */}
                <CertificateHealthWidget
                    data={{
                        expired: 2,
                        expiringSoon: 5,
                        valid: 142,
                    }}
                    onViewDetails={() => setShowCertModal(true)}
                />

                {/* Card 3: Action Required */}
                <div className="bg-white p-5 rounded shadow">
                    <h3 className="text-sm font-semibold text-gray-500">
                        Action Required
                    </h3>
                    <p className="text-sm mt-2 text-gray-700">
                        Monitor upcoming certificate expirations. Two partners
                        are currently impacted by expired certificates.
                    </p>
                </div>

                {/* Narrative Panel */}
                <div className="md:col-span-3 bg-blue-50 p-5 rounded border border-blue-200">
                    <h4 className="font-semibold mb-2">
                        What’s happening?
                    </h4>
                    <p className="text-sm text-gray-700">
                        Recent failures are isolated to outbound requests
                        involving partner systems with expired or soon-to-expire
                        trust certificates. Core platform services remain stable,
                        and inbound transactions are operating normally.
                    </p>
                </div>
            </div>

            {/* Cert Inspector Modal */}
            {showCertModal && (
                <CertInspectorModal
                    onClose={() => setShowCertModal(false)}
                    cert={{
                        subject: "CN=api.partner.org",
                        issuer: "DigiCert Global G2",
                        thumbprint: "A3:F9:92:4C:88:AA:01:BC",
                        notBefore: "2024-12-15",
                        notAfter: "2025-12-15",
                        status: "Expired",
                        detectedVia: "Live Transaction",
                    }}
                />
            )}
        </>
    );
};

export default ExecutiveSummary;
