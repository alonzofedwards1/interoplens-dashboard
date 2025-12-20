import React, { useEffect, useMemo, useState } from 'react';
import { FaUserPlus, FaUsersCog } from 'react-icons/fa';
import { UserRole } from '../../types/auth';
import {
    addUser,
    AppUser,
    getUsers,
} from '../../features/settings/data/usersStore';

interface Props {
    role?: UserRole | null;
}

const roleCopy: Record<UserRole, string> = {
    admin: 'Admin',
    analyst: 'Analyst',
    committee: 'Committee',
};

const UserManagementSettings: React.FC<Props> = ({ role }) => {
    const isAdmin = role === 'admin';
    const [users, setUsers] = useState<AppUser[]>([]);
    const [form, setForm] = useState({
        name: '',
        email: '',
        role: 'analyst' as UserRole,
        password: '',
    });
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setUsers(getUsers());
    }, []);

    const counts = useMemo(
        () =>
            users.reduce(
                (acc, user) => {
                    acc[user.role] = (acc[user.role] ?? 0) + 1;
                    return acc;
                },
                {} as Record<UserRole, number>
            ),
        [users]
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);
        setError(null);

        if (!isAdmin) {
            setError('Only administrators can add users.');
            return;
        }

        if (!form.email.trim() || !form.password.trim()) {
            setError('Email and a temporary password are required.');
            return;
        }

        try {
            const newUser = await addUser(form);
            setUsers(prev => [...prev, newUser]);
            setForm({ name: '', email: '', role: 'analyst', password: '' });
            setStatus(`${newUser.email} invited as ${roleCopy[newUser.role]}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to add user.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
                {(['admin', 'analyst', 'committee'] as UserRole[]).map(key => (
                    <div
                        key={key}
                        className="rounded-lg border border-base-300 bg-base-200 px-3 py-2"
                    >
                        <p className="text-xs uppercase tracking-wide text-base-content/70">
                            {roleCopy[key]}
                        </p>
                        <p className="text-lg font-semibold">{counts[key] ?? 0}</p>
                    </div>
                ))}
            </div>

            <div className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body space-y-4">
                    <div className="flex items-center gap-2">
                        <FaUsersCog className="text-primary" />
                        <div>
                            <h3 className="font-semibold">Directory</h3>
                            <p className="text-sm text-base-content/70">
                                Active and invited users who can access the dashboard
                            </p>
                        </div>
                    </div>

                    <div className="divide-y divide-base-200">
                        {users.map(user => (
                            <div
                                key={user.id}
                                className="py-3 flex items-center justify-between gap-3"
                            >
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-base-content/70">{user.email}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="badge badge-outline capitalize">
                                        {roleCopy[user.role]}
                                    </span>
                                    <span
                                        className={`badge ${
                                            user.status === 'active'
                                                ? 'badge-success'
                                                : 'badge-warning'
                                        } badge-outline`}
                                    >
                                        {user.status === 'active' ? 'Active' : 'Invited'}
                                    </span>
                                    <span className="text-xs text-base-content/60">
                                        Added {user.createdAt}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {!users.length && (
                            <p className="py-3 text-sm text-base-content/70">
                                No users yet. Add your first teammate below.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body space-y-4">
                    <div className="flex items-center gap-2">
                        <FaUserPlus className="text-primary" />
                        <div>
                            <h3 className="font-semibold">Add user</h3>
                            <p className="text-sm text-base-content/70">
                                Invite teammates with a role-based access profile.
                                {isAdmin
                                    ? ' Passwords can be rotated after first login.'
                                    : ' Only administrators can invite new users.'}
                            </p>
                        </div>
                    </div>

                    {status && (
                        <div className="alert alert-success text-sm">{status}</div>
                    )}
                    {error && <div className="alert alert-error text-sm">{error}</div>}

                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
                        <label className="form-control">
                            <span className="label-text">Full name</span>
                            <input
                                className="input input-bordered"
                                value={form.name}
                                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Casey Admin"
                                disabled={!isAdmin}
                            />
                        </label>
                        <label className="form-control">
                            <span className="label-text">Email</span>
                            <input
                                className="input input-bordered"
                                type="email"
                                value={form.email}
                                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="user@example.com"
                                required
                                disabled={!isAdmin}
                            />
                        </label>
                        <label className="form-control">
                            <span className="label-text">Role</span>
                            <select
                                className="select select-bordered"
                                value={form.role}
                                onChange={e =>
                                    setForm(prev => ({
                                        ...prev,
                                        role: e.target.value as UserRole,
                                    }))
                                }
                                disabled={!isAdmin}
                            >
                                <option value="admin">Admin</option>
                                <option value="analyst">Analyst</option>
                                <option value="committee">Committee</option>
                            </select>
                        </label>
                        <label className="form-control">
                            <span className="label-text">Temporary password</span>
                            <input
                                className="input input-bordered"
                                type="password"
                                value={form.password}
                                onChange={e =>
                                    setForm(prev => ({ ...prev, password: e.target.value }))
                                }
                                placeholder="At least 8 characters"
                                required
                                disabled={!isAdmin}
                            />
                        </label>
                        <div className="md:col-span-2 flex justify-end">
                            <button className="btn btn-primary" type="submit" disabled={!isAdmin}>
                                Invite user
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserManagementSettings;
