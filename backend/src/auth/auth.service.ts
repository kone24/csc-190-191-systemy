import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // needed for JSON tokens

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {} 

  async login(username: string, password: string) {
    // Temporary fake logic
    if (username === 'admin' && password === '1234') {
      const payload = { username };
      const token = this.jwtService.sign(payload, { expiresIn: '20m' }); 
      return { message: 'Login successful', user: { username }, token };
    } else {
      return { message: 'Invalid credentials' };
    }
  }
}