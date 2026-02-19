import { Module } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtSecret } from './jwt.secret';
import { DatabaseModule } from '../database/database.module';

@Module({
  providers: [JwtStrategy],
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: jwtSecret.secret,
      signOptions: { expiresIn: '1day' },
    }),
  ],
  exports: [JwtModule],
})
export class AuthenticationModule {}
