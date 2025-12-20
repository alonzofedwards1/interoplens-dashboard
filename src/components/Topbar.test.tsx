import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import Topbar from './Topbar';

const mockNavigate = jest.fn();

jest.mock(
    'react-router-dom',
    () => ({
        __esModule: true,
        useNavigate: () => mockNavigate,
    }),
    { virtual: true }
);

describe('Topbar', () => {
    beforeEach(() => {
        mockNavigate.mockReset();
    });

    it('switches environments and shows status', () => {
        render(<Topbar role="admin" onLogout={() => undefined} />);

        const envToggle = screen.getByRole('button', { name: 'Test' });
        fireEvent.click(envToggle);
        fireEvent.click(screen.getByRole('menuitem', { name: 'Prod' }));

        expect(screen.getByText('Healthy')).toBeInTheDocument();
        expect(envToggle).toHaveTextContent('Prod');
    });

    it('navigates through quick actions', () => {
        render(<Topbar role="committee" onLogout={() => undefined} />);

        fireEvent.click(screen.getByRole('button', { name: /quick actions/i }));
        fireEvent.click(
            screen.getByRole('menuitem', { name: /knowledge base/i })
        );

        expect(mockNavigate).toHaveBeenCalledWith('/knowledge-base');
    });
});
