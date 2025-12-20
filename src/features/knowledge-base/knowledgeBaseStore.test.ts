import { committeeCasesData } from '../committee/data/committeeCases.data';
import {
    hasKnowledgeBaseArticle,
    readKnowledgeBase,
    upsertKnowledgeBaseArticleFromCase,
} from './knowledgeBaseStore';

beforeEach(() => {
    localStorage.clear();
});

test('seeds knowledge base from defaults when storage is empty', () => {
    const articles = readKnowledgeBase();

    expect(articles).not.toHaveLength(0);
    expect(hasKnowledgeBaseArticle('FND-1041')).toBe(true);
});

test('upserts a knowledge base article from a committee case', () => {
    const targetCase = committeeCasesData.find(
        (committeeCase) => committeeCase.id === 'FND-1029'
    );

    if (!targetCase) throw new Error('Seed case missing');

    upsertKnowledgeBaseArticleFromCase(targetCase, 'Require immediate certificate rotation');

    const articles = readKnowledgeBase();
    const article = articles.find((entry) => entry.caseId === targetCase.id);

    expect(article).toBeDefined();
    expect(article?.decision).toBe('Require immediate certificate rotation');
    expect(article?.title).toContain(targetCase.organization);
});
