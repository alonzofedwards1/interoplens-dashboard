export interface KnowledgeBaseArticle {
    id: string;

    sourceCaseId: string;
    organization: string;
    issueType: string;

    title: string;
    summary: string;
    resolution: string;

    severity: 'Critical' | 'Warning' | 'Ok';

    tags?: string[];

    createdBy?: string;
    createdAt: string;

    published: boolean;
    publishedAt?: string;
}
