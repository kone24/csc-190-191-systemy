import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import * as jwksRsa from 'jwks-rsa';

@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(Strategy, 'supabase-jwt') {
  constructor() {
    const projectRef = process.env.SUPABASE_PROJECT_REF;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksUri: `https://${projectRef}.supabase.co/auth/v1/.well-known/jwks.json`,
      }),
      algorithms: ['ES256'],
      audience: 'authenticated',
      issuer: `https://${projectRef}.supabase.co/auth/v1`,
    });
  }

  async validate(payload: any) {
    return {
      type: 'supabase',
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}