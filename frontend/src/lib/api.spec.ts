import { apiFetch } from './api';

// ---------------------------------------------------------------------------
// Mock global fetch
// ---------------------------------------------------------------------------

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('apiFetch', () => {
    const BACKEND_URL = 'http://localhost:3001';

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NEXT_PUBLIC_BACKEND_URL = BACKEND_URL;
    });

    // =========================================================================
    // URL construction
    // =========================================================================

    it('prepends NEXT_PUBLIC_BACKEND_URL to path', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: 'test' }),
        });

        await apiFetch(null, '/clients');

        expect(mockFetch).toHaveBeenCalledWith(
            `${BACKEND_URL}/clients`,
            expect.any(Object),
        );
    });

    it('uses empty string as base when NEXT_PUBLIC_BACKEND_URL is not set', async () => {
        delete process.env.NEXT_PUBLIC_BACKEND_URL;
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });

        await apiFetch(null, '/clients');

        expect(mockFetch).toHaveBeenCalledWith('/clients', expect.any(Object));
    });

    // =========================================================================
    // Authorization header
    // =========================================================================

    it('sets Authorization header when token is provided', async () => {
        mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

        await apiFetch('my-token', '/clients');

        const callArgs = mockFetch.mock.calls[0][1];
        expect(callArgs.headers['Authorization']).toBe('Bearer my-token');
    });

    it('omits Authorization header when token is null', async () => {
        mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

        await apiFetch(null, '/clients');

        const callArgs = mockFetch.mock.calls[0][1];
        expect(callArgs.headers['Authorization']).toBeUndefined();
    });

    // =========================================================================
    // Error handling
    // =========================================================================

    it('throws Error with response text when res.ok is false', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            text: async () => 'Not Found',
        });

        await expect(apiFetch(null, '/missing')).rejects.toThrow('Not Found');
    });

    it('throws Error with empty text when response text is empty', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            text: async () => '',
        });

        await expect(apiFetch(null, '/missing')).rejects.toThrow('');
    });

    // =========================================================================
    // Success
    // =========================================================================

    it('returns parsed JSON on success', async () => {
        const payload = { clients: [{ id: 'c1' }] };
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => payload,
        });

        const result = await apiFetch('tok', '/clients');
        expect(result).toEqual(payload);
    });

    it('passes through additional init options (method, body)', async () => {
        mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

        await apiFetch('tok', '/clients', { method: 'POST', body: JSON.stringify({ name: 'X' }) });

        const callArgs = mockFetch.mock.calls[0][1];
        expect(callArgs.method).toBe('POST');
        expect(callArgs.body).toBe(JSON.stringify({ name: 'X' }));
    });
});
