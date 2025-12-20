import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { committeeCasesData } from './data/committeeCases.data';
import {
    CommitteeStatus,
    committeeStatusStyles,
} from './data/committeeStatus';

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

    const [status, setStatus] = useState<CommitteeStatus>(
        caseData?.status ?? 'Pending Review'
    );
    const [selectedDecision, setSelectedDecision] = useState<string | undefined>(
        caseData?.selectedDecision
    );
    const [kbGenerated, setKbGenerated] = useState(false);
    const [alert, setAlert] = useState<string | null>(null);

    const hasDecision = Boolean(selectedDecision);
    const isDecisionPending = status === 'Decision Required';
    const isDecisionMade = status === 'Decision Made';
    const isResolved = status === 'Resolved';

    const canRecordDecision = isDecisionPending && hasDecision;
    const canResolveCase = (isDecisionMade || isResolved) && hasDecision;
    const canGenerateKb = isResolved && !kbGenerated;

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
                                status ? committeeStatusStyles[status] : ''
                            }`}
                        >
              {status}
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
                        events={useMemo(
                            () => [
                                { label: 'Entered Committee', active: true },
                                {
                                    label: 'Under Review',
                                    active:
                                        status === 'In Committee' ||
                                        status === 'Decision Required',
                                },
                                {
                                    label: 'Decision Required',
                                    active: status === 'Decision Required',
                                },
                                {
                                    label: 'Decision Made',
                                    active: status === 'Decision Made' || status === 'Resolved',
                                },
                                {
                                    label: 'Resolution Complete',
                                    active: status === 'Resolved',
                                },
                            ],
                            [status]
                        )}
                    />

                    <DecisionPanel
                        options={caseData.decisionOptions}
                        selectedOption={selectedDecision}
                        onSelect={(value) => {
                            setSelectedDecision(value);
                            setAlert(null);
                        }}
                    />

                    {/* Action Buttons */}
                    <div className="bg-white rounded-lg shadow p-5 space-y-3">
                        <button
                            disabled={!canRecordDecision}
                            onClick={() => {
                                if (!canRecordDecision) return;
                                setStatus('Decision Made');
                                setAlert('Decision recorded. Ready for resolution.');
                            }}
                            className={`w-full px-4 py-2 rounded font-medium ${
                                canRecordDecision
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            Mark Decision Made
                        </button>

                        {!canRecordDecision && (
                            <p className="text-xs text-gray-500" role="note">
                                Select a decision option to record the committee decision.
                            </p>
                        )}

                        <button
                            disabled={!canResolveCase}
                            onClick={() => {
                                if (!canResolveCase) return;
                                setStatus('Resolved');
                                setAlert(
                                    'Case resolved. You can now publish a knowledge base article.'
                                );
                            }}
                            className={`w-full px-4 py-2 rounded font-medium ${
                                canResolveCase
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            Resolve Case
                        </button>

                        {status !== 'Decision Made' && !isResolved && (
                            <p className="text-xs text-gray-500" role="note">
                                A recorded decision is required before the case can be resolved.
                            </p>
                        )}

                        {isResolved && (
                            <p className="text-sm text-gray-600">
                                Decision documented and case resolved. Publish to the knowledge
                                base to share learnings.
                            </p>
                        )}
                    </div>

                    {/* Resolution Panel */}
                    <ResolutionPanel
                        canResolve={isResolved}
                        isGenerated={kbGenerated}
                        onGenerateKB={() => {
                            if (!canGenerateKb) return;
                            setKbGenerated(true);
                            setAlert('Knowledge base article queued for publication.');
                        }}
                    />
                </div>
            </div>

            {alert && (
                <div className="fixed bottom-6 right-6 max-w-md rounded-lg bg-gray-900 text-white px-4 py-3 shadow-lg" role="status">
                    {alert}
                </div>
            )}
        </div>
    );
};

export default CommitteeCaseDetail;
