import { Controller, Post, Body, Res, Get, UseGuards, Req, Query } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('login body:', body); // TEMP: see what we receive
    const { username, password } = body ?? {};

    const result = await this.authService.login(username, password);

    if (result?.token) {
      res.cookie('access_token', result.token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 20, // 20 minutes
        path: '/',
      });
      return { ok: true, user: result.user };
    }

    // return { ok: false, message: result.message };
    return { ok: false, message: result?.message ?? 'Invalid credentials' };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    console.log('User logging out, clearing session cookie');

    res.clearCookie('access_token', { path: '/', httpOnly: true });
    return { ok: true, message: 'Logged out successfully', redirect: '/login' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    return req['user']; // payload: { username }
  }

  @Get('google')
  redirectToGoogle(@Res() res: Response) {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      response_type: 'code',
      scope: process.env.GOOGLE_SCOPES!,
      access_type: 'offline',
      prompt: 'consent',
    });

    // optional domain restriction (workspace users only)
    // add GOOGLE_WORKSPACE_DOMAIN=domain.com to .env to test this
    if (process.env.GOOGLE_WORKSPACE_DOMAIN) {
      params.set('hd', process.env.GOOGLE_WORKSPACE_DOMAIN);
    }

    return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  }

  @Get('google/callback')
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const code = req.query.code as string;

    if (!code) {
      return res.redirect('http://localhost:3000/login?error=oauth');
    }

    const tokenResponse = await fetch(
      'https://oauth2.googleapis.com/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          code,
          grant_type: 'authorization_code',
          redirect_uri: process.env.GOOGLE_REDIRECT_URI || '',
        }).toString(),
      },
    );

    const tokenData = await tokenResponse.json() as {
      id_token?: string;
      scope?: string;
      error?: string;
    };

    // basic error handling
    if (!tokenResponse.ok || tokenData.error || !tokenData.id_token) {
      const tokenErrorMessage = 'Google sign-in failed. Please try again.';
      res.cookie('oauth_error', tokenErrorMessage, {
        httpOnly: false,
        maxAge: 30 * 1000,
        path: '/',
      });
      return res.redirect('http://localhost:3000/login?error=oauth');
    }

    // Validate granted scopes and show message if missing
    const grantedScopes = (tokenData.scope || '').split(' ').filter(Boolean);
    const requiredScopes = (process.env.GOOGLE_SCOPES || '').split(' ').filter(Boolean);
    const missingScopes = requiredScopes.filter((s) => !grantedScopes.includes(s));

    if (missingScopes.length) {
      const scopeLabel: Record<string, string> = {
        'https://www.googleapis.com/auth/calendar.readonly': 'Calendar',
        'https://www.googleapis.com/auth/contacts.readonly': 'Contacts',
      };
      const labels = missingScopes
        .map((scope) => scopeLabel[scope])
        .filter(Boolean);

      const message = labels.length
        ? `Please grant ${labels.join(' and ')} access to continue.`
        : 'Please grant all requested Google permissions to continue.';

      res.cookie('oauth_error', message, {
        httpOnly: false,
        maxAge: 30 * 1000,
        path: '/',
      });
      return res.redirect('http://localhost:3000/login');
    }

    const result = await this.authService.googleLogin(tokenData.id_token);

    if (!result.ok) {
      res.cookie('oauth_error', result.message, {
        httpOnly: false,
        maxAge: 30 * 1000,
        path: '/',
      });
      const errorParam = result.message.includes('restricted') ? 'domain' : 'oauth';
      return res.redirect(`http://localhost:3000/login?error=${errorParam}`);
    }

    res.cookie('access_token', result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 20, // 20 minutes
      path: '/',
    });
    return res.redirect('http://localhost:3000/dashboard');
  }

  /**
   * Demo endpoint: find a user by email or user_id.
   * GET /auth/find-user?email=someone@futureandsuns.com
   * GET /auth/find-user?id=<uuid>
   */
  @Get('find-user')
  async findUser(
    @Query('email') email?: string,
    @Query('id') id?: string,
  ) {
    if (email) {
      return this.authService.findUserByEmail(email);
    }
    if (id) {
      return this.authService.findUserById(id);
    }
    return { ok: false, message: 'Provide ?email= or ?id= query parameter' };
  }
}
