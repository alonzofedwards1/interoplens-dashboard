import { UserRole } from '../../types/auth';

export type ApiUserStatus = 'active' | 'invited';

export type ApiUser = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: ApiUserStatus;
    createdAt: string;
};

/**
 * Dummy API for Phase 0:
 * GET /api/users
 */
export const fetchUsers = async (): Promise<ApiUser[]> => {
    return [
        {
            id: 'user-admin',
            name: 'Interoplens Admin',
            email: 'admin@interoplens.io',
            role: 'admin',
            status: 'active',
            createdAt: '2024-03-12',
        },
        {
            id: 'user-analyst',
            name: 'Analyst User',
            email: 'analyst@interoplens.io',
            role: 'analyst',
            status: 'active',
            createdAt: '2024-02-05',
        },
    ];
};
