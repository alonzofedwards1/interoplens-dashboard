import React from 'react';
import { Link } from 'react-router-dom';

/* ============================
   Types
============================ */

type CertificateHealthData = {
    expired: number;
    expiringSoon: number;
    valid: number | null;
};

type Props = {
    data?: CertificateHealthData;
    errorMessage: string | null;
    onViewDetails: () => void;
    impactedLink: string;
};

/* ============================
   Component
============================ */

const ExecutiveSummary: React.FC<Props> = ({
                                               data,
                                               errorMessage,
                                               onViewDetails,
                                               impactedLink,
                                           }) => {
    if (errorMessage) {
        return (
            <div className="rounded border border-red-200 bg-red-50 p-4 text-red-800">
                {errorMessage}
            </div>
        );
    }

    if (!data) {
        return (
            <div className="rounded border border-gray-200 bg-gray-50 p-4 text-gray-600">
                Certificate health data is unavailable.
            </div>
        );
    }

    const { expired, expiringSoon, valid } = data;
    const hasCriticalIssues = expired > 0;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                    Certificate Health Summary
                </h2>

                <button
                    onClick={onViewDetails}
                    className="text-sm font-medium text-blue-600 hover:underline"
                >
                    View details
                </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded border bg-white p-4">
                    <div className="text-sm text-gray-500">Expired</div>
                    <div
                        className={`text-2xl font-bold ${
                            expired > 0 ? 'text-red-600' : 'text-gray-800'
                        }`}
                    >
                        {expired}
                    </div>
                </div>

                <div className="rounded border bg-white p-4">
                    <div className="text-sm text-gray-500">Expiring Soon</div>
                    <div
                        className={`text-2xl font-bold ${
                            expiringSoon > 0
                                ? 'text-yellow-600'
                                : 'text-gray-800'
                        }`}
                    >
                        {expiringSoon}
                    </div>
                </div>

                <div className="rounded border bg-white p-4">
                    <div className="text-sm text-gray-500">Valid</div>
                    <div className="text-2xl font-bold text-green-600">
                        {valid ?? '—'}
                    </div>
                </div>
            </div>

            {/* Narrative */}
            <div className="rounded border bg-gray-50 p-4 text-sm text-gray-700">
                {hasCriticalIssues ? (
                    <>
                        <strong className="text-red-700">
                            Action required:
                        </strong>{' '}
                        One or more integrations are failing due to expired
                        security certificates. Patient Discovery transactions
                        will continue to fail until these certificates are
                        renewed.
                    </>
                ) : (
                    <>
                        Certificate health is within acceptable limits. No
                        critical certificate failures detected.
                    </>
                )}
            </div>

            {/* CTA */}
            {hasCriticalIssues && (
                <div>
                    <Link
                        to={impactedLink}
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline"
                    >
                        View impacted organizations →
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ExecutiveSummary;
