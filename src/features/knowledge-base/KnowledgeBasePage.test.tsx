import React from 'react';
import { render, screen, within } from '@testing-library/react';
import KnowledgeBasePage from './KnowledgeBasePage';
import { upsertKnowledgeBaseArticleFromCase } from './knowledgeBaseStore';
import { committeeCasesData } from '../committee/data/committeeCases.data';

const mockNavigate = jest.fn();

jest.mock(
    'react-router-dom',
    () => ({
        useNavigate: () => mockNavigate,
    }),
    { virtual: true }
);

beforeEach(() => {
    localStorage.clear();
});

test('renders seeded knowledge base article', () => {
    render(<KnowledgeBasePage />);

    expect(
        screen.getByRole('heading', { name: /knowledge base articles/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/VA Puget Sound/i).length).toBeGreaterThan(0);
});

test('lists article queued from committee workflow', () => {
    const targetCase = committeeCasesData.find(
        (committeeCase) => committeeCase.id === 'FND-1034'
    );
    if (!targetCase) throw new Error('Missing committee case');

    upsertKnowledgeBaseArticleFromCase(targetCase, targetCase.selectedDecision);

    render(<KnowledgeBasePage />);

    const row = screen.getByText(targetCase.id).closest('tr');
    expect(row).not.toBeNull();
    if (row) {
        expect(within(row).getByText(/queued/i)).toBeInTheDocument();
    }
});
