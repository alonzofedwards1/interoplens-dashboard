import { committeeCasesData } from '../../committee/data/committeeCases.data';

export type KnowledgeBaseStatus = 'queued' | 'draft' | 'published';

export interface KnowledgeBaseArticle {
    id: string;
    caseId: string;
    title: string;
    organization: string;
    decision: string;
    resolutionSummary: string;
    updatedAt: string;
    status: KnowledgeBaseStatus;
    tags: string[];
}

const resolvedCases = committeeCasesData.filter(
    (committeeCase) => committeeCase.status === 'Resolved'
);

export const knowledgeBaseSeed: KnowledgeBaseArticle[] = [
    ...resolvedCases.map((committeeCase) => ({
        id: `KB-${committeeCase.id}`,
        caseId: committeeCase.id,
        title: `${committeeCase.issueType} – ${committeeCase.organization}`,
        organization: committeeCase.organization,
        decision: committeeCase.selectedDecision ?? 'Decision documented',
        resolutionSummary: committeeCase.committeeReason,
        updatedAt: `${committeeCase.decisionTarget}T10:15:00Z`,
        status: 'queued' as KnowledgeBaseStatus,
        tags: [committeeCase.issueType, committeeCase.severity],
    })),
    {
        id: 'KB-PLAYBOOK-PD',
        caseId: 'PLAYBOOK-PD',
        title: 'PD Recovery Playbook – Common patterns',
        organization: 'Interoplens Reference',
        decision: 'Documented PD recovery steps published for partners',
        resolutionSummary:
            'Aggregated lessons learned from PD retry loops, certificate trust failures, and production surges to accelerate RCA.',
        updatedAt: '2025-12-09T08:00:00Z',
        status: 'published',
        tags: ['Patient Discovery', 'Reliability', 'Playbook'],
    },
];
