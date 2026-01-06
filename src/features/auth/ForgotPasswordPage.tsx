import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setError('Email is required to request a reset.');
            setMessage('');
            return;
        }

        setError('');
        setMessage(
            'Password reset is currently handled offline. Please contact your administrator or use the demo credentials to sign in.'
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 space-y-6">
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-semibold text-gray-800">Reset Password</h1>
                    <p className="text-sm text-gray-500">Request a password reset link.</p>
                </div>

                {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="reset-email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="reset-email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
                    >
                        Send reset instructions
                    </button>
                </form>

                <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-sm text-blue-700 underline hover:text-blue-800"
                >
                    Back to sign in
                </button>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
