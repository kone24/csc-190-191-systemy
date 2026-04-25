import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt.guard';

function makeContext(overrides: {
    method?: string;
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
}): ExecutionContext {
    const req = {
        method: overrides.method ?? 'GET',
        headers: overrides.headers ?? {},
        cookies: overrides.cookies ?? {},
    };
    return {
        switchToHttp: () => ({
            getRequest: () => req,
        }),
    } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;
    const mockJwtService = {} as any;

    beforeEach(() => {
        process.env.FRONTEND_URL = 'http://localhost:3000';
        guard = new JwtAuthGuard(mockJwtService);
    });

    // =========================================================================
    // Basic error/user falsy cases
    // =========================================================================

    it('throws UnauthorizedException when err is truthy', () => {
        const ctx = makeContext({});
        expect(() =>
            guard.handleRequest(new Error('bad token'), null, null, ctx),
        ).toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when user is falsy', () => {
        const ctx = makeContext({});
        expect(() => guard.handleRequest(null, null, null, ctx)).toThrow(
            UnauthorizedException,
        );
    });

    it('throws UnauthorizedException when user is undefined', () => {
        const ctx = makeContext({});
        expect(() => guard.handleRequest(null, undefined, null, ctx)).toThrow(
            UnauthorizedException,
        );
    });

    // =========================================================================
    // GET — no CSRF check needed
    // =========================================================================

    it('returns user for GET with cookie auth (no CSRF check)', () => {
        const ctx = makeContext({
            method: 'GET',
            cookies: { access_token: 'token123' },
        });
        const user = { id: 'user-1' };
        const result = guard.handleRequest(null, user, null, ctx);
        expect(result).toBe(user);
    });

    it('returns user for HEAD with cookie auth (no CSRF check)', () => {
        const ctx = makeContext({
            method: 'HEAD',
            cookies: { access_token: 'token123' },
        });
        const user = { id: 'user-1' };
        expect(guard.handleRequest(null, user, null, ctx)).toBe(user);
    });

    it('returns user for OPTIONS request (no CSRF check)', () => {
        const ctx = makeContext({
            method: 'OPTIONS',
            cookies: { access_token: 'token123' },
        });
        const user = { id: 'user-1' };
        expect(guard.handleRequest(null, user, null, ctx)).toBe(user);
    });

    // =========================================================================
    // Bearer token — no CSRF check for state-changing
    // =========================================================================

    it('returns user for POST with Bearer token (no CSRF check)', () => {
        const ctx = makeContext({
            method: 'POST',
            headers: { authorization: 'Bearer sometoken' },
        });
        const user = { id: 'user-1' };
        expect(guard.handleRequest(null, user, null, ctx)).toBe(user);
    });

    it('returns user for PATCH with Bearer token (no CSRF check)', () => {
        const ctx = makeContext({
            method: 'PATCH',
            headers: { authorization: 'Bearer sometoken' },
        });
        const user = { id: 'user-1' };
        expect(guard.handleRequest(null, user, null, ctx)).toBe(user);
    });

    it('returns user for DELETE with Bearer token (no CSRF check)', () => {
        const ctx = makeContext({
            method: 'DELETE',
            headers: { authorization: 'Bearer sometoken' },
        });
        const user = { id: 'user-1' };
        expect(guard.handleRequest(null, user, null, ctx)).toBe(user);
    });

    // =========================================================================
    // POST with cookie auth — origin check
    // =========================================================================

    it('throws "Untrusted origin" for POST with cookie auth and missing origin', () => {
        const ctx = makeContext({
            method: 'POST',
            cookies: { access_token: 'token123' },
            headers: {},
        });
        expect(() => guard.handleRequest(null, { id: 'u1' }, null, ctx)).toThrow(
            'Untrusted origin for state-changing cookie-auth request',
        );
    });

    it('throws "Untrusted origin" for POST with cookie auth and wrong origin', () => {
        const ctx = makeContext({
            method: 'POST',
            cookies: { access_token: 'token123' },
            headers: { origin: 'http://evil.com' },
        });
        expect(() => guard.handleRequest(null, { id: 'u1' }, null, ctx)).toThrow(
            'Untrusted origin for state-changing cookie-auth request',
        );
    });

    // =========================================================================
    // POST with cookie auth + correct origin — CSRF check
    // =========================================================================

    it('throws "CSRF token validation failed" when CSRF header is missing', () => {
        const ctx = makeContext({
            method: 'POST',
            cookies: { access_token: 'token123', csrf_token: 'secret' },
            headers: { origin: 'http://localhost:3000' },
        });
        expect(() => guard.handleRequest(null, { id: 'u1' }, null, ctx)).toThrow(
            'CSRF token validation failed',
        );
    });

    it('throws "CSRF token validation failed" when CSRF header mismatches cookie', () => {
        const ctx = makeContext({
            method: 'POST',
            cookies: { access_token: 'token123', csrf_token: 'secret' },
            headers: { origin: 'http://localhost:3000', 'x-csrf-token': 'wrong' },
        });
        expect(() => guard.handleRequest(null, { id: 'u1' }, null, ctx)).toThrow(
            'CSRF token validation failed',
        );
    });

    it('throws "CSRF token validation failed" when cookie CSRF token is missing', () => {
        const ctx = makeContext({
            method: 'POST',
            cookies: { access_token: 'token123' },
            headers: { origin: 'http://localhost:3000', 'x-csrf-token': 'secret' },
        });
        expect(() => guard.handleRequest(null, { id: 'u1' }, null, ctx)).toThrow(
            'CSRF token validation failed',
        );
    });

    it('returns user for POST with cookie auth + correct origin + matching CSRF tokens', () => {
        const ctx = makeContext({
            method: 'POST',
            cookies: { access_token: 'token123', csrf_token: 'mysecret' },
            headers: { origin: 'http://localhost:3000', 'x-csrf-token': 'mysecret' },
        });
        const user = { id: 'u1' };
        expect(guard.handleRequest(null, user, null, ctx)).toBe(user);
    });

    it('returns user for PATCH with cookie auth + correct origin + matching CSRF tokens', () => {
        const ctx = makeContext({
            method: 'PATCH',
            cookies: { access_token: 'token123', csrf_token: 'tok' },
            headers: { origin: 'http://localhost:3000', 'x-csrf-token': 'tok' },
        });
        const user = { id: 'u1' };
        expect(guard.handleRequest(null, user, null, ctx)).toBe(user);
    });

    it('returns user for DELETE with cookie auth + correct origin + matching CSRF tokens', () => {
        const ctx = makeContext({
            method: 'DELETE',
            cookies: { access_token: 'token123', csrf_token: 'tok' },
            headers: { origin: 'http://localhost:3000', 'x-csrf-token': 'tok' },
        });
        const user = { id: 'u1' };
        expect(guard.handleRequest(null, user, null, ctx)).toBe(user);
    });

    // =========================================================================
    // Trailing slash normalization
    // =========================================================================

    it('normalizes trailing slashes in origin comparison', () => {
        process.env.FRONTEND_URL = 'http://localhost:3000/';
        guard = new JwtAuthGuard(mockJwtService);
        const ctx = makeContext({
            method: 'POST',
            cookies: { access_token: 'tok', csrf_token: 'csrf' },
            headers: { origin: 'http://localhost:3000', 'x-csrf-token': 'csrf' },
        });
        const user = { id: 'u1' };
        expect(guard.handleRequest(null, user, null, ctx)).toBe(user);
    });
});
