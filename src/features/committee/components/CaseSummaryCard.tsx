import React from 'react';

interface CaseSummaryCardProps {
    committeeReason: string;
    issueType: string;
    firstDetected: string;
    escalationTrigger: string;
    affectedParties: string[];
}

const CaseSummaryCard: React.FC<CaseSummaryCardProps> = ({
                                                             committeeReason,
                                                             issueType,
                                                             firstDetected,
                                                             escalationTrigger,
                                                             affectedParties,
                                                         }) => {
    return (
        <section className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold mb-4">Case Summary</h2>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                    <dt className="text-gray-500">Committee Reason</dt>
                    <dd className="font-medium">{committeeReason}</dd>
                </div>

                <div>
                    <dt className="text-gray-500">Issue Type</dt>
                    <dd>{issueType}</dd>
                </div>

                <div>
                    <dt className="text-gray-500">First Detected</dt>
                    <dd>{firstDetected}</dd>
                </div>

                <div>
                    <dt className="text-gray-500">Escalation Trigger</dt>
                    <dd>{escalationTrigger}</dd>
                </div>

                <div className="sm:col-span-2">
                    <dt className="text-gray-500">Affected Parties</dt>
                    <dd>{affectedParties.join(', ')}</dd>
                </div>
            </dl>
        </section>
    );
};

export default CaseSummaryCard;
