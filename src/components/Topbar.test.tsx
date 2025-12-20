import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import Topbar from './Topbar';

const mockNavigate = jest.fn();
let mockPathname = '/dashboard';

jest.mock(
    'react-router-dom',
    () => ({
        __esModule: true,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ pathname: mockPathname }),
        Link: ({ to, children }: any) => <a href={to}>{children}</a>,
    }),
    { virtual: true }
);

describe('Topbar', () => {
    beforeEach(() => {
        mockNavigate.mockReset();
        mockPathname = '/dashboard';
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

    it('renders breadcrumbs for the current path', () => {
        mockPathname = '/committee/FND-1029';
        render(<Topbar role="committee" onLogout={() => undefined} />);

        expect(
            screen.getByRole('link', { name: /committee/i })
        ).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /fnd-1029/i })).toHaveAttribute(
            'href',
            '/committee/FND-1029'
        );
    });
});
