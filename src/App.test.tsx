import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock(
    'react-router-dom',
    () => ({
        Navigate: ({ to }: { to: string }) => <div>Navigate to {to}</div>,
        Route: ({ element }: { element: React.ReactElement }) => element,
        Routes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        useNavigate: () => jest.fn(),
    }),
    { virtual: true }
);

test('renders the login screen when no session exists', () => {
    sessionStorage.clear();
    render(<App />);

    expect(
        screen.getByRole('heading', { name: /interoplens/i })
    ).toBeInTheDocument();
});
