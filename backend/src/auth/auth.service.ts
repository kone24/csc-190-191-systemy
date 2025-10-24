import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    async login(identifier: string, password: string) {
        // Temporary fake logic
        // Accept either username 'admin' or email 'admin@example.com' for local testing
        const validIdentifiers = ['admin@example.com'];
        if (validIdentifiers.includes(identifier) && password === '1234') {
            return { message: 'Login successful', user: { identifier } };
        } else {
            return { message: 'Invalid credentials' };
        }
    }
}
