import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';    // Needed for JSON tokens

@Module({
   imports: [
    JwtModule.register({
      secret: 'YOUR_SECRET_KEY',          // REPLACE AFTER TESTING!
      signOptions: { expiresIn: '20m' },  // sign in only valid for 20 minutes of inactivity
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
