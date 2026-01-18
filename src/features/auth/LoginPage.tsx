import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!username.trim() || !password.trim()) {
            setError('Username and password are required.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await login(username.trim(), password);
            navigate('/dashboard', { replace: true });
        } catch (loginError) {
            const message =
                loginError instanceof Error
                    ? loginError.message
                    : 'Unable to sign in. Please try again.';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 space-y-6">
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-semibold text-gray-800">Interoplens</h1>
                    <p className="text-sm text-gray-500">
                        Interoperability Behavior Analysis Dashboard
                    </p>
                </div>

                {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="login-username"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            id="login-username"
                            value={username}
                            onChange={event => setUsername(event.target.value)}
                            autoComplete="username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="login-password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="login-password"
                            value={password}
                            onChange={event => setPassword(event.target.value)}
                            autoComplete="current-password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-md transition"
                    >
                        {submitting ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
