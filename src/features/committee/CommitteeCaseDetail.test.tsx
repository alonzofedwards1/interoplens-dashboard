import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommitteeCaseDetail from './CommitteeCaseDetail';

const mockNavigate = jest.fn();
const mockParams: { id?: string } = {};

jest.mock(
    'react-router-dom',
    () => ({
        useNavigate: () => mockNavigate,
        useParams: () => mockParams,
    }),
    { virtual: true }
);

const renderCase = (caseId: string) => {
    mockParams.id = caseId;
    mockNavigate.mockClear();
    return render(<CommitteeCaseDetail />);
};

test('decision required case records decision before resolution', async () => {
    renderCase('FND-1029');

    const markDecisionButton = screen.getByRole('button', {
        name: /mark decision made/i,
    });
    expect(markDecisionButton).toBeDisabled();
    expect(
        screen.getByText(/select a decision option to record the committee decision/i)
    ).toBeInTheDocument();

    await userEvent.click(
        screen.getByLabelText('Require immediate certificate rotation')
    );

    expect(markDecisionButton).toBeEnabled();
    await userEvent.click(markDecisionButton);

    expect(screen.getByText('Decision Made')).toBeInTheDocument();
    expect(
        screen.getByRole('button', {
            name: /resolve case/i,
        })
    ).toBeEnabled();
});

test('decision made case can be resolved and queued for knowledge base publication', async () => {
    renderCase('FND-1034');

    const resolveButton = screen.getByRole('button', { name: /resolve case/i });
    await userEvent.click(resolveButton);

    const generateButton = screen.getByRole('button', {
        name: /generate knowledge base article/i,
    });

    expect(generateButton).toBeEnabled();
    await userEvent.click(generateButton);

    expect(
        screen.getByRole('button', { name: /knowledge base article queued/i })
    ).toBeDisabled();
    expect(
        screen.getByText(/knowledge base article queued for publication/i)
    ).toBeInTheDocument();
});

test('resolved cases keep guidance visible and gate knowledge base generation', async () => {
    renderCase('FND-1041');

    expect(
        screen.getByText(
            /decision documented and case resolved\. publish to the knowledge base to share learnings\./i
        )
    ).toBeInTheDocument();

    const generateButton = screen.getByRole('button', {
        name: /generate knowledge base article/i,
    });
    expect(generateButton).toBeEnabled();

    await userEvent.click(generateButton);

    expect(
        screen.getByRole('button', { name: /knowledge base article queued/i })
    ).toBeDisabled();
});
