import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { committeeCasesData } from './data/committeeCases.data';
import { committeeStatusStyles } from './data/committeeStatus';

import CaseSummaryCard from './components/CaseSummaryCard';
import EvidenceSnapshot from './components/EvidenceSnapshot';
import DecisionTimeline from './components/DecisionTimeline';
import DecisionPanel from './components/DecisionPanel';
import LinkedFindingsTable from './components/LinkedFindingsTable';
import ResolutionPanel from './components/ResolutionPanel';

const CommitteeCaseDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const caseData = committeeCasesData.find((c) => c.id === id);

    const [selectedDecision, setSelectedDecision] = useState<string | undefined>(
        caseData?.selectedDecision
    );

    if (!caseData) {
        return (
            <div className="p-6">
                <p className="text-gray-600">Committee case not found.</p>
                <button
                    onClick={() => navigate('/committee')}
                    className="mt-4 text-blue-600 hover:underline"
                >
                    ← Back to Committee Queue
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Committee Case <span className="font-mono">#{caseData.id}</span>
                    </h1>
                    <div className="mt-2 flex items-center gap-3 text-sm">
                        <span>{caseData.organization}</span>
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs">
              {caseData.severity}
            </span>
                        <span
                            className={`px-2 py-0.5 rounded text-xs ${
                                committeeStatusStyles[caseData.status]
                            }`}
                        >
              {caseData.status}
            </span>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-xs text-gray-500">Decision Target</div>
                    <div className="font-medium">{caseData.decisionTarget}</div>
                    <button
                        onClick={() => navigate('/committee')}
                        className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                        ← Back to Committee Queue
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <CaseSummaryCard
                        committeeReason={caseData.committeeReason}
                        issueType={caseData.issueType}
                        firstDetected={caseData.firstDetected}
                        escalationTrigger={caseData.escalationTrigger}
                        affectedParties={caseData.affectedParties}
                    />

                    <EvidenceSnapshot items={caseData.evidence} />

                    <LinkedFindingsTable findings={caseData.linkedFindings} />
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <DecisionTimeline
                        events={[
                            { label: 'Entered Committee' },
                            { label: 'Under Review' },
                            {
                                label:
                                    caseData.status === 'Decision Required'
                                        ? 'Decision Required'
                                        : 'Decision Complete',
                                active: caseData.status === 'Decision Required',
                            },
                        ]}
                    />

                    <DecisionPanel
                        options={caseData.decisionOptions}
                        selectedOption={selectedDecision}
                        onSelect={setSelectedDecision}
                    />

                    {/* Action Buttons */}
                    <div className="bg-white rounded-lg shadow p-5 space-y-3">
                        {caseData.status === 'Decision Required' && (
                            <button
                                disabled={!selectedDecision}
                                className={`w-full px-4 py-2 rounded font-medium ${
                                    selectedDecision
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                Mark Decision Made
                            </button>
                        )}

                        {caseData.status === 'Decision Made' && (
                            <button className="w-full px-4 py-2 rounded font-medium bg-green-600 text-white hover:bg-green-700">
                                Resolve Case
                            </button>
                        )}

                        {caseData.status === 'Resolved' && (
                            <button className="w-full px-4 py-2 rounded font-medium bg-blue-600 text-white hover:bg-blue-700">
                                Generate Knowledge Base Article
                            </button>
                        )}
                    </div>

                    {/* Resolution Panel (Resolved only) */}
                    {caseData.status === 'Resolved' && (
                        <ResolutionPanel
                            canResolve
                            onGenerateKB={() => {
                                console.log('Generate KB Article for', caseData.id);
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommitteeCaseDetail;
