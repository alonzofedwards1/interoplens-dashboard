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

export const knowledgeBaseSeed: KnowledgeBaseArticle[] = [
    {
        id: 'KB-FND-1041',
        caseId: 'FND-1041',
        title: 'Repeated Query Failures – VA Puget Sound',
        organization: 'VA Puget Sound',
        decision: 'Enforce stricter certificate validation',
        resolutionSummary:
            'Resolved certificate trust ambiguity across trading partners and standardized validation enforcement.',
        updatedAt: '2025-12-17T10:15:00Z',
        status: 'queued',
        tags: ['Patient Discovery', 'Certificate Health', 'Critical'],
    },
];
