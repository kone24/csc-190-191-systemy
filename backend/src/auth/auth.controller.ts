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

    return { ok: false, message: result?.message ?? 'Invalid credentials' };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
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

    const tokenData = await tokenResponse.json() as { id_token?: string };

    if (!tokenData.id_token) {
      return res.redirect('http://localhost:3000/login?error=oauth');
    }

    const result = await this.authService.googleLogin(tokenData.id_token);

    if (!result.ok) {
      // Domain mismatch or token verification failure — block access.
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
