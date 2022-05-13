import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities';
import { AuthPayload } from './interfaces/auth-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }

  async comparePassword(
    password: string,
    hashPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashPassword);
  }

  async authentication(
    phoneNumber: string,
    password: string,
  ): Promise<User | false> {
    const user = await this.userService.findUserByPhoneNumber(phoneNumber);
    const check = await this.comparePassword(password, user.password);
    if (!user || !check) {
      return false;
    }

    return user;
  }

  async login(user: User) {
    const payload: AuthPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: { ...payload },
    };
  }
}
