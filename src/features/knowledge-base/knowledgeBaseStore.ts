import { CommitteeCase } from '../committee/data/committeeCases.data';
import {
    KnowledgeBaseArticle,
    knowledgeBaseSeed,
    KnowledgeBaseStatus,
} from './data/knowledgeBase.data';

const STORAGE_KEY = 'interoplens_knowledge_base_articles';

const persist = (articles: KnowledgeBaseArticle[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
    return articles;
};

export const readKnowledgeBase = (): KnowledgeBaseArticle[] => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
        return persist(knowledgeBaseSeed);
    }

    try {
        const parsed: KnowledgeBaseArticle[] = JSON.parse(stored);
        return parsed.length ? parsed : persist(knowledgeBaseSeed);
    } catch (error) {
        return persist(knowledgeBaseSeed);
    }
};

export const upsertKnowledgeBaseArticleFromCase = (
    committeeCase: CommitteeCase,
    decision: string | undefined,
    status: KnowledgeBaseStatus = 'queued'
) => {
    const articles = readKnowledgeBase();
    const existingIndex = articles.findIndex(
        (article) => article.caseId === committeeCase.id
    );

    const timestamp = new Date().toISOString();
    const baseArticle: KnowledgeBaseArticle = {
        id: `KB-${committeeCase.id}`,
        caseId: committeeCase.id,
        title: `${committeeCase.issueType} – ${committeeCase.organization}`,
        organization: committeeCase.organization,
        decision: decision ?? committeeCase.selectedDecision ?? 'Pending decision',
        resolutionSummary: committeeCase.committeeReason,
        updatedAt: timestamp,
        status,
        tags: [committeeCase.issueType, committeeCase.severity],
    };

    if (existingIndex !== -1) {
        const existing = articles[existingIndex];
        articles[existingIndex] = {
            ...existing,
            ...baseArticle,
            id: existing.id,
            updatedAt: timestamp,
        };
        return persist(articles);
    }

    return persist([...articles, baseArticle]);
};

export const hasKnowledgeBaseArticle = (caseId: string) =>
    readKnowledgeBase().some((article) => article.caseId === caseId);
