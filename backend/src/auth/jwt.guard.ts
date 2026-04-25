import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

function normalizeOrigin(url: string) {
    return url.replace(/\/+$/, '');
}

function firstHeaderValue(value: string | string[] | undefined) {
    if (Array.isArray(value)) return value[0] || '';
    return value || '';
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly jwtService: JwtService) {
        super();
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        if (err || !user) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        const req = context.switchToHttp().getRequest<Request>();
        const method = (req.method || 'GET').toUpperCase();
        const isStateChanging = !['GET', 'HEAD', 'OPTIONS'].includes(method);
        const authHeader = req.headers.authorization;
        const hasBearer = typeof authHeader === 'string' && authHeader.startsWith('Bearer ');
        const hasCookieToken = !!req.cookies?.access_token;

        // If auth came from cookie on a mutating request, require trusted browser origin.
        if (isStateChanging && hasCookieToken && !hasBearer) {
            const expectedOrigin = normalizeOrigin(process.env.FRONTEND_URL || 'http://localhost:3000');
            const requestOrigin = normalizeOrigin(String(req.headers.origin || ''));
            if (!requestOrigin || requestOrigin !== expectedOrigin) {
                throw new UnauthorizedException('Untrusted origin for state-changing cookie-auth request');
            }

            const cookieCsrfToken = req.cookies?.csrf_token;
            const headerCsrfToken = firstHeaderValue(req.headers['x-csrf-token']);
            if (!cookieCsrfToken || !headerCsrfToken || headerCsrfToken !== cookieCsrfToken) {
                throw new UnauthorizedException('CSRF token validation failed');
            }
        }

        return user;
    }
}
