import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'phoneNumber' });
  }

  async validate(phoneNumber: string, password: string) {
    const user = await this.authService.authentication(phoneNumber, password);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
