import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';       // need for JSON tokens (expiration)

@Injectable()
export class AuthService {
    async login(username: string, password: string) {
        // Temporary fake logic
        if (username === 'admin' && password === '1234') {
            const payload = { username };
            const token = this.jwtService.sign(payload, { expiresIn: '20m' });      // token will expire in 20 minutes
            return { message: 'Login successful', user: { username } };
        } else {
            return { message: 'Invalid credentials' };
        }
    }
  }
}
