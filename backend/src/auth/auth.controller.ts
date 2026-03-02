import { Controller, Post, Body, Res, Get, UseGuards, Req } from '@nestjs/common';
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        }),
      },
    );

    const tokenData = await tokenResponse.json();

    // basic error handling
    if (tokenData.error) {
      console.warn('Google token exchange failed', tokenData);
      return res.redirect('http://localhost:3000/login?error=oauth');
    }

    const grantedScopes: string[] = (tokenData.scope || '').split(' ');
    const requiredScopes: string[] = (process.env.GOOGLE_SCOPES || '').split(' ');
    const missing = requiredScopes.filter(s => !grantedScopes.includes(s));
    if (missing.length) {
      return res.redirect(
        `http://localhost:3000/login?error=missing_scopes&scopes=${encodeURIComponent(
          missing.join(' '),
        )}`,
      );
    }

    const loginResult = await this.authService.handleGoogleCallback(tokenData);

    if (loginResult?.token) {
      res.cookie('access_token', loginResult.token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 20,
        path: '/',
      });
    }
    return res.redirect('http://localhost:3000/dashboard');
  }
}
