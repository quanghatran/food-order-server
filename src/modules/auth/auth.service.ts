import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { Role, Store, User } from 'src/entities';
import { AuthPayload } from './interfaces/auth-payload.interface';
import { MailService } from '../mailer/mailer.service';
import { StoreService } from '../store/store.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly storeService: StoreService,
    private readonly mailService: MailService,
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
  ): Promise<User | Store | false> {
    const user =
      (await this.userService.findUserByPhoneNumber(phoneNumber)) ||
      (await this.storeService.findUserByPhoneNumber(phoneNumber));
    if (!user) return false;
    const check = await this.comparePassword(password, user.password);
    if (!check) return false;

    return user;
  }

  async mailAuthenticateUser(user: User | Store) {
    const payload: AuthPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
    };
    const token = this.jwtService.sign(payload, { expiresIn: '30m' });
    const content = `Click this link to active your account:\n ${process.env.FE_URl}/auth/verify/${token}`;
    try {
      await this.mailService.sendMail(user.email, content);
    } catch (error) {
      throw new BadRequestException('Email is not exist!');
    }
  }

  async mailForgetPassword(user: User | Store) {
    const payload: AuthPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
    };
    const token = this.jwtService.sign(payload, { expiresIn: '30m' });
    const content = `Click this link to reset your password:\n ${process.env.FE_URl}/reset-password/${token}`;
    try {
      await this.mailService.sendMail(user.email, content);
    } catch (error) {
      throw new BadRequestException('Email is not exist!');
    }
  }

  async login(user: any) {
    const payload: AuthPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
    };

    const role = user.role ? user.role : Role.Store;
    return {
      accessToken: this.jwtService.sign(payload),
      user: { ...payload, role },
    };
  }
}
