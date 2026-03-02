import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // needed for JSON tokens

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) { }

  async login(username: string, password: string) {
    // Temporary fake logic
    if (username === 'admin' && password === '1234') {
      const user = { username };
      const payload = { username };

      const token = this.jwtService.sign(payload, { expiresIn: '20m' });

      return { message: 'Login successful', user, token };
    } else {
      return { message: 'Invalid credentials' };
    }
  }
  
  async handleGoogleCallback(tokenData: any) {
    const idPayload: any = this.jwtService.decode(tokenData.id_token) as any;
    const email: string | undefined = idPayload?.email;

    if (!email) {
      return { message: 'Unable to read Google token' };
    }

    const user = { username: email, email };


    const payload: any = {
      username: email,
      scopes: tokenData.scope || '',
    };

    const token = this.jwtService.sign(payload, { expiresIn: '20m' });

    return { message: 'Google login successful', user, token };
  }
}
