import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import * as config from 'config';
import { AuthPayload } from '../interfaces/auth-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.secret,
    });
  }

  async validate(payload: AuthPayload) {
    return {
      id: payload.id,
      name: payload.name,
      phoneNumber: payload.phoneNumber,
      email: payload.email,
    };
  }
}
