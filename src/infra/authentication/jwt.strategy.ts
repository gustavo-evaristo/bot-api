import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtSecret } from './jwt.secret';
import { IUserRepository } from 'src/domain/repositories/user.repository';

interface Payload {
  id: string;
}

interface Output {
  id: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: IUserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret.secret,
    });
  }

  async validate(payload: Payload): Promise<Output> {
    if (!payload.id) {
      throw new UnauthorizedException();
    }

    const user = await this.userRepository.get(payload.id);

    if (!user) {
      throw new UnauthorizedException();
    }

    return { id: user.id.toString() };
  }
}
