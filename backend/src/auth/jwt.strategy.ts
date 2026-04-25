import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      // Accept either Authorization header (SPA flow) or httpOnly cookie (OAuth redirect flow).
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: any) => req?.cookies?.access_token ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });

    // Fail fast in production when JWT secret is missing.
    if (!this.configService.get<string>('JWT_SECRET') && process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
  }

  async validate(payload: any) {
    if (!payload?.username) return null;
    const result = await this.authService.findUserByEmail(payload.username);
    if (!result.ok) return null;
    return payload;
  }
}