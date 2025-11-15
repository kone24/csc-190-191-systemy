import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    // This handles what happens when authentication fails
    handleRequest(err: any, user: any, info: any, context: any) {
        console.log('Auth guard check:', { err, user, info }); // Debug log

        // If token is missing, invalid, or expired -> return 401
        if (err || !user) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        // If everything is good, return the user (gets attached to req.user)
        return user;
    }
}
