import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; 

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(username: string, password: string) {
  if (username !== 'admin') {
    return { code: 'INVALID_EMAIL' };
  }
  if (password !== '1234') {
    return { code: 'INCORRECT_PASSWORD' };
  }

  const payload = { username };
  const token = this.jwtService.sign(payload, { expiresIn: '20m' });

  return { ok: true, user: { username }, token };
}

}
