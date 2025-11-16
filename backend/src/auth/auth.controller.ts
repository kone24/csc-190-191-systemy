import { Controller, Post, Body, Res, Get, UseGuards, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { LOGIN_ERRORS } from './loginErrors';

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

    if (result.ok) {
      res.cookie('access_token', result.token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 20,
        path: '/',
      });
      return { ok: true, user: result.user };
    }

    // Safely map failure code to LOGIN_ERRORS
    const message = 'code' in result && result.code
      ? LOGIN_ERRORS[result.code] ?? LOGIN_ERRORS.DEFAULT
      : LOGIN_ERRORS.DEFAULT;

    return { ok: false, message };
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
}
