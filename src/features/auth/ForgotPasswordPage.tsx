import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    requestPasswordReset,
    resetPassword,
    PasswordResetRequestResult,
} from '../../lib/authClient';
import { isAuthEnabled } from '../../config/auth';

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [requestResult, setRequestResult] = useState<PasswordResetRequestResult | null>(
        null
    );
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isRequesting, setIsRequesting] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    if (!isAuthEnabled) return null;

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsRequesting(true);

        try {
            const result = await requestPasswordReset(email);
            setRequestResult(result);
            setMessage(result.message);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsRequesting(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!requestResult?.email) {
            setError('Request a reset code first.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsResetting(true);
        try {
            const result = await resetPassword(requestResult.email, token, newPassword);
            setMessage(result.message);
            setRequestResult(null);
            setToken('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold text-gray-800">Reset password</h1>
                        <p className="text-sm text-gray-500">
                            Request a reset link and verify with your code.
                        </p>
                    </div>
                    <button
                        className="text-sm text-blue-700 underline"
                        onClick={() => navigate('/login')}
                    >
                        Back to sign in
                    </button>
                </div>

                {message && (
                    <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRequest} className="space-y-4 border p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-800">Request reset</h2>
                            <p className="text-xs text-gray-500">
                                We will email you a verification code.
                            </p>
                        </div>
                        <span className="text-[10px] uppercase tracking-wide text-gray-400">Step 1</span>
                    </div>

                    <label className="block text-sm text-gray-700">
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </label>

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition disabled:opacity-60"
                        disabled={isRequesting}
                    >
                        {isRequesting ? 'Sending...' : 'Send reset link'}
                    </button>

                    {requestResult?.via === 'local' && requestResult.token && (
                        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
                            Dev-only reset code: <strong>{requestResult.token}</strong>
                            {requestResult.expiresAt && (
                                <span className="block text-[10px] text-amber-600 mt-1">
                                    Expires at {new Date(requestResult.expiresAt).toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                    )}
                </form>

                <form onSubmit={handleReset} className="space-y-4 border p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-800">Verify code</h2>
                            <p className="text-xs text-gray-500">
                                Paste the code you received and choose a new password.
                            </p>
                        </div>
                        <span className="text-[10px] uppercase tracking-wide text-gray-400">Step 2</span>
                    </div>

                    <label className="block text-sm text-gray-700">
                        Verification code
                        <input
                            type="text"
                            value={token}
                            onChange={e => setToken(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </label>

                    <label className="block text-sm text-gray-700">
                        New password
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </label>

                    <label className="block text-sm text-gray-700">
                        Confirm password
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </label>

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition disabled:opacity-60"
                        disabled={isResetting}
                    >
                        {isResetting ? 'Updating...' : 'Update password'}
                    </button>
                </form>

                <p className="text-xs text-gray-400 text-center">
                    Dev hint: seeded admin account {`admin@interoplens.io / admin123`} is always available.
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
