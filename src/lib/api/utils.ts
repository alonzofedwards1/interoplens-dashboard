export async function safeJson(response: Response) {
    const text = await response.text();

    try {
        return text ? JSON.parse(text) : null;
    } catch {
        throw new Error('Invalid JSON response');
    }
}
