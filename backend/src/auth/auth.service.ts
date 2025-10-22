import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    async login(username: string, password: string) {
        // Temporary fake logic
        if (username === 'admin' && password === '1234') {
            return { message: 'Login successful', user: { username } };
        } else {
            return { message: 'Invalid credentials' };
        }
    }
}
