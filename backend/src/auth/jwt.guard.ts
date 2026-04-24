import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly jwtService: JwtService) {
        super();
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        if (err || !user) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        // Sliding session: issue a fresh 20-min token on every authenticated request
        try {
            const res = context.switchToHttp().getResponse();
            const { iat, exp, ...payload } = user;
            const freshToken = this.jwtService.sign(payload, { expiresIn: '20m' });
            res.cookie('access_token', freshToken, {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                maxAge: 1000 * 60 * 20,
                path: '/',
            });
        } catch {
            // If refresh fails, don't block — the existing token is still valid
        }

        return user;
    }
}
