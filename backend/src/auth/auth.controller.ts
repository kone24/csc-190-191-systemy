import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    // accept either { username, password } or { email, password }
    login(@Body() body: { username?: string; email?: string; password: string }) {
        const id = body.username ?? body.email ?? '';
        return this.authService.login(id, body.password);
    }
}
