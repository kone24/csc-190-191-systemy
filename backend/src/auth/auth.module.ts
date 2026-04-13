import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt'; // Needed for JSON tokens
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt.guard';
import { RolesGuard } from './roles.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret', // REPLACE AFTER TESTING!
      signOptions: { expiresIn: '20m' }, // sign in only valid for 20 minutes of inactivity
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule { }
