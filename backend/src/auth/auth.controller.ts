import { Controller, Post, Body, Res, Get, UseGuards, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';

@Controller('auth') 
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post('login')
  // async login(
  //   @Body() body: { username: string; password: string },
  //   @Res({ passthrough: true}) res: Response,
  // ) {
  //   const { username, password } = body;
  //   const result = await this.authService.login(username, password);

  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('login body:', body); // TEMP: see what we receive
    const { username, password } = body ?? {};

    const result = await this.authService.login(username, password);

    if(result?.token) {
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
    res.clearCookie('access_token', { path: '/' });
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    return req['user']; // payload: { username }
  }
}
