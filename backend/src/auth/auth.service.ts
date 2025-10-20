import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';       // need for JSON tokens (expiration)
import {randomUUID} from 'crypto';              // for generating unique IDs

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) {} 


    private async validateUser(username: string, password: string) {
        // Temporary fake logic
        if (username === 'admin' && password === '1234') {
            return { userId: 1, username: 'admin' };
            
        } else {
        return null;
        }
    }

    async login(username: string, password: string) {
        const user = await this.validateUser(username, password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { username: user.username, sub: user.userId, jti: randomUUID() }; // jti is unique token ID

        return {
            message: 'Login successful',
            user: { id: user.userId, username: user.username },
            access_token: await this.jwtService.signAsync(payload),
        };
    }

    async loginWithGoogle(googleProfile: { id: string; email: string; name: string }) {
        
        const payload = { username: googleProfile.email, sub: googleProfile.id, jti: randomUUID() };
        return {
            message: 'Google login successful',
            user: { id: googleProfile.id, email: googleProfile.email, name: googleProfile.name },
            access_token: await this.jwtService.signAsync(payload),
        };

    }

}


