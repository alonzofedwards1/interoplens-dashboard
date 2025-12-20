export interface OidKnowledgeBaseArticle {
    id: string;
    title: string;
    summary: string;
    relatedOid?: string;
    tags: string[];
    createdAt: string;
    updatedAt?: string;
}
