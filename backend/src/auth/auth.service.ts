import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // needed for JSON tokens

const ALLOWED_DOMAIN = '@futureandsuns.com';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) { }

  async login(username: string, password: string) {
    // Temporary fake logic
    if (username === 'admin' && password === '1234') {
      const user = { username };
      const payload = { username };

      const token = this.jwtService.sign(payload, { expiresIn: '20m' });

      return { message: 'Login successful', user, token };
    } else {
      return { message: 'Invalid credentials' };
    }
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

    const info = await infoRes.json() as { email?: string; aud?: string; error_description?: string };

    if (!info.email) {
      return { ok: false, message: 'No email found in Google token' };
    }

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

    const user = { email: info.email };
    const token = this.jwtService.sign({ username: info.email }, { expiresIn: '20m' });

    return { ok: true, token, user };
  }
}
