import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthSupabaseService } from './auth.supabase.service';

const ALLOWED_DOMAIN = '@futureandsuns.com';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authDb: AuthSupabaseService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_ANON_KEY')!,
    );
  }

  async login(username: string, password: string) {
    if (username === 'admin' && password === '1234') {
      const user = { username };
      const payload = { username };

      const token = this.jwtService.sign(payload, { expiresIn: '20m' });

      return { message: 'Login successful', user, token };
    } else {
      return { message: 'Invalid credentials' };
    }
  }

  async googleLogin(
    idToken: string,
  ): Promise<
    | { ok: true; token: string; user: { email: string } }
    | { ok: false; message: string }
  > {
    const infoRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
    );

    if (!infoRes.ok) {
      return { ok: false, message: 'Failed to verify Google ID token' };
    }

    const info = (await infoRes.json()) as {
      email?: string;
      aud?: string;
      error_description?: string;
    };

    if (!info.email) {
      return { ok: false, message: 'No email found in Google token' };
    }

    const devAllowedEmails = (process.env.DEV_ALLOWED_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isDevAllowed = devAllowedEmails.includes(info.email.toLowerCase());

    if (!isDevAllowed && !info.email.endsWith(ALLOWED_DOMAIN)) {
      return {
        ok: false,
        message: `Access restricted to ${ALLOWED_DOMAIN} accounts`,
      };
    }

    if (!isDevAllowed) {
      const { data: dbUser, error: dbError } = await this.supabase
        .from('users')
        .select('email')
        .eq('email', info.email.toLowerCase())
        .single();

      if (dbError || !dbUser) {
        return {
          ok: false,
          message:
            'User not found. Contact your administrator to be added to the system.',
        };
      }
    }

    const user = { email: info.email };
    const token = this.jwtService.sign(
      { username: info.email },
      { expiresIn: '20m' },
    );

    return { ok: true, token, user };
  }

  async findUserByEmail(email: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !data) {
      return { ok: false, message: 'User not found', error: error?.message };
    }

    return { ok: true, user: data };
  }

  async findUserById(userId: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('user_id', userId) // change to user_id if your table uses user_id
      .single();

    if (error || !data) {
      return { ok: false, message: 'User not found', error: error?.message };
    }

    return { ok: true, user: data };
  }

  async getMyUser(authUserId: string) {
    const { data, error } = await this.authDb.db
      .from('users')
      .select('user_id, name, email, role, team_id')
      .eq('user_id', authUserId) // change to user_id if your table uses user_id
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('User not found in users table');
      }
      throw new InternalServerErrorException(error.message);
    }

    return {
      user_id: data.user_id,
      name: data.name,
      email: data.email,
      role: data.role,
      team_id: data.team_id,
    };
  }
}