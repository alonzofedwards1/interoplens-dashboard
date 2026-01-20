import React, { useEffect, useMemo, useState } from 'react';
import { FaUsersCog } from 'react-icons/fa';
import { UserRole } from '../../types/auth';
import { ApiUser, fetchUsers } from '../../lib/api/users';

const roleCopy: Record<UserRole, string> = {
    admin: 'Admin',
    analyst: 'Analyst',
    committee: 'Committee',
};

const UserManagementSettings: React.FC = () => {
    const [users, setUsers] = useState<ApiUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            try {
                const data = await fetchUsers();
                if (isMounted) {
                    setUsers(data);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setError(
                        err instanceof Error ? err.message : 'Unable to load users.'
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        load();
        return () => {
            isMounted = false;
        };
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
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <FaUsersCog className="text-primary" />
                            <div>
                                <h3 className="font-semibold">Directory</h3>
                                <p className="text-sm text-base-content/70">
                                    Active and invited users who can access the dashboard
                                </p>
                            </div>
                        </div>
                        <button
                            className="btn btn-outline btn-sm"
                            disabled
                            title="User invitations available in Phase 1"
                        >
                            Add user
                        </button>
                    </div>

                    {error && <div className="alert alert-error text-sm">{error}</div>}

                    {loading ? (
                        <div className="text-sm text-base-content/70">
                            Loading user directory...
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="text-xs uppercase tracking-wide text-base-content/60">
                                    <th className="py-2 text-left">Name</th>
                                    <th className="py-2 text-left">Email</th>
                                    <th className="py-2 text-left">Role</th>
                                    <th className="py-2 text-left">Status</th>
                                    <th className="py-2 text-left">Added</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-base-200">
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td className="py-2 font-medium">{user.name}</td>
                                        <td className="py-2 text-base-content/70">
                                            {user.email}
                                        </td>
                                        <td className="py-2">
                                            <span className="badge badge-outline capitalize">
                                                {roleCopy[user.role]}
                                            </span>
                                        </td>
                                        <td className="py-2">
                                            <span
                                                className={`badge badge-outline ${
                                                    user.status === 'active'
                                                        ? 'badge-success'
                                                        : 'badge-warning'
                                                }`}
                                            >
                                                {user.status === 'active'
                                                    ? 'Active'
                                                    : 'Invited'}
                                            </span>
                                        </td>
                                        <td className="py-2 text-base-content/60">
                                            {user.createdAt}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManagementSettings;
