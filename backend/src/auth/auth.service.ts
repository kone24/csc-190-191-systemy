import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // needed for JSON tokens
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const ALLOWED_DOMAIN = '@gmail.com';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  async googleLogin(idToken: string): Promise<
    | { ok: true; token: string; user: { email: string } }
    | { ok: false; message: string }
  > {
    // Verify the Google ID token and extract claims via Google's tokeninfo endpoint.
    const infoRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
    );

    if (!infoRes.ok) {
      return { ok: false, message: 'Failed to verify Google ID token' };
    }

    const info = await infoRes.json() as { email?: string; aud?: string; error_description?: string; picture?: string };

    if (!info.email) {
      return { ok: false, message: 'No email found in Google token' };
    }
    const avatarUrl = info.picture || null;

    // Dev allowlist: personal emails explicitly whitelisted via DEV_ALLOWED_EMAILS env var.
    const devAllowedEmails = (process.env.DEV_ALLOWED_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isDevAllowed = devAllowedEmails.includes(info.email.toLowerCase());

    // Domain restriction: only @futureandsuns.com accounts (or dev allowlist) are allowed.
    if (!isDevAllowed && !info.email.endsWith(ALLOWED_DOMAIN)) {
      return {
        ok: false,
        message: `Access restricted to ${ALLOWED_DOMAIN} accounts`,
      };
    }

    // Check if the user already exists in the users table.
    const { data: dbUser } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', info.email.toLowerCase())
      .single();

    if (!dbUser) {
      // Auto-provision new user with avatar
      const emailPrefix = info.email.split('@')[0];
      const { error: insertError } = await this.supabase
        .from('users')
        .insert({ email: info.email.toLowerCase(), name: emailPrefix, role: 'staff', avatar: avatarUrl });
      if (insertError) {
        console.error('Supabase insert error:', insertError);
        return {
          ok: false,
          message: 'Failed to create user account. Please contact your administrator.',
        };
      }
    } else if (avatarUrl && dbUser.avatar !== avatarUrl) {
      // Update avatar if changed
      await this.supabase
        .from('users')
        .update({ avatar: avatarUrl })
        .eq('email', info.email.toLowerCase());
    }

    const user = { email: info.email };
    const token = this.jwtService.sign({ username: info.email }, { expiresIn: '20m' });

    return { ok: true, token, user };
  }

  /**
   * Find a user record by email address.
   */
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

  /**
   * Find a user record by user_id.
   */
  async findUserById(userId: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return { ok: false, message: 'User not found', error: error?.message };
    }

    return { ok: true, user: data };
  }
}
