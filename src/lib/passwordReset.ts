const STORAGE_KEY = 'passwordResetTokens';
const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

export interface ResetTokenRecord {
    email: string;
    token: string;
    createdAt: number;
    expiresAt: number;
}

const loadTokens = (): ResetTokenRecord[] => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    try {
        return JSON.parse(raw) as ResetTokenRecord[];
    } catch (error) {
        console.error('Failed to parse password reset tokens', error);
        return [];
    }
};

const saveTokens = (tokens: ResetTokenRecord[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
};

const generateToken = () =>
    typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const pruneExpired = (tokens: ResetTokenRecord[]) => {
    const now = Date.now();
    return tokens.filter(record => record.expiresAt > now);
};

export const issueLocalResetToken = (email: string): ResetTokenRecord => {
    const normalizedEmail = email.trim().toLowerCase();
    const tokens = pruneExpired(loadTokens());
    const token = generateToken();
    const record: ResetTokenRecord = {
        email: normalizedEmail,
        token,
        createdAt: Date.now(),
        expiresAt: Date.now() + TOKEN_TTL_MS,
    };

    saveTokens([...tokens, record]);
    return record;
};

export const consumeLocalResetToken = (
    email: string,
    token: string
): ResetTokenRecord | null => {
    const normalizedEmail = email.trim().toLowerCase();
    const tokens = pruneExpired(loadTokens());
    const match = tokens.find(
        record => record.email === normalizedEmail && record.token === token
    );

    if (!match) {
        saveTokens(tokens);
        return null;
    }

    const remaining = tokens.filter(record => record !== match);
    saveTokens(remaining);
    return match;
};

export const resetLocalTokens = () => {
    localStorage.removeItem(STORAGE_KEY);
};
