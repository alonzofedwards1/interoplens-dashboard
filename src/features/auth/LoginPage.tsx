import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticate, AuthResult } from '../../lib/authClient';

interface LoginProps {
    onLogin: (result: AuthResult) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const result = await authenticate(email, password);
            setError('');
            onLogin(result);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 space-y-6">
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-semibold text-gray-800">
                        Interoplens
                    </h1>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
                    >
                        Sign In
                    </button>
                </form>

                <div className="text-center text-xs text-gray-400 pt-4 border-t">
                    Demo Environment · Synthetic Data
                </div>
            </div>
        </div>
    );
};

export default Login;
