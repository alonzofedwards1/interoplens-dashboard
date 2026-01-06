import { UserRole } from '../../../types/auth';
import { hashPassword } from '../../../lib/password';

export type UserStatus = 'active' | 'invited';

export interface AppUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    passwordHash: string;
    status: UserStatus;
    createdAt: string;
}

const STORAGE_KEY = 'appUsers';

const seedUsers: AppUser[] = [
    {
        id: 'user-admin',
        name: 'Interoplens Admin',
        email: 'admin@interoplens.io',
        role: 'admin',
        passwordHash:
            '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
        status: 'active',
        createdAt: '2024-03-12',
    },
    {
        id: 'user-analyst',
        name: 'Analyst User',
        email: 'analyst@interoplens.io',
        role: 'analyst',
        passwordHash:
            'da3c7436e41590a9f7c2195af2940a678d72e13018c8e748c88394439424bdd5',
        status: 'active',
        createdAt: '2024-02-05',
    },
    {
        id: 'user-committee',
        name: 'Committee Member',
        email: 'committee@interoplens.io',
        role: 'committee',
        passwordHash:
            '4cd12d8f6611827a17b1c720288efe092047de6539e388ad046a785c1fe2f33a',
        status: 'active',
        createdAt: '2024-01-22',
    },
];

const readUsers = (): AppUser[] => {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    try {
        return JSON.parse(raw) as AppUser[];
    } catch (error) {
        console.error('Failed to read users from storage', error);
        return [];
    }
};

const writeUsers = (users: AppUser[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

export const getUsers = () => {
    const existing = readUsers();
    if (existing.length) return existing;

    writeUsers(seedUsers);
    return seedUsers;
};

export const addUser = async ({
    name,
    email,
    role,
    password,
}: {
    name: string;
    email: string;
    role: UserRole;
    password: string;
}) => {
    const normalizedEmail = email.trim().toLowerCase();
    const currentUsers = getUsers();

    if (currentUsers.some(user => user.email === normalizedEmail)) {
        throw new Error('A user with that email already exists.');
    }

    const passwordHash = await hashPassword(password);
    const newUser: AppUser = {
        id: `user-${Date.now()}`,
        name: name.trim() || normalizedEmail,
        email: normalizedEmail,
        role,
        passwordHash,
        status: 'invited',
        createdAt: new Date().toISOString().slice(0, 10),
    };

    const updatedUsers = [...currentUsers, newUser];
    writeUsers(updatedUsers);

    return newUser;
};

export const resetUsers = () => {
    localStorage.removeItem(STORAGE_KEY);
    return getUsers();
};

export const updateUserPassword = async (
    email: string,
    password: string
): Promise<AppUser | null> => {
    const normalizedEmail = email.trim().toLowerCase();
    const users = getUsers();
    const target = users.find(user => user.email === normalizedEmail);

    if (!target) return null;

    const passwordHash = await hashPassword(password);
    const updatedUser: AppUser = { ...target, passwordHash, status: 'active' };
    const updatedUsers = users.map(user =>
        user.email === normalizedEmail ? updatedUser : user
    );

    writeUsers(updatedUsers);
    return updatedUser;
};
