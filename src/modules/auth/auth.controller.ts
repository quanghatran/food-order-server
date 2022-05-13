import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local.guard';
import { CredentialsDto } from './dto/credentials.dto';
import { GetUser } from 'src/share/decorators/get-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('/register')
  async register(@Body() user: CreateUserDto) {
    const checkPhoneNumber = await this.userService.findUserByPhoneNumber(
      user.phoneNumber,
    );
    if (checkPhoneNumber) {
      throw new HttpException(
        'Phone number already existed',
        HttpStatus.BAD_REQUEST,
      );
    }

    const checkEmail = await this.userService.findUserByEmail(user.email);
    if (checkEmail) {
      throw new HttpException('Email already existed', HttpStatus.BAD_REQUEST);
    }
    user.password = await this.authService.hashPassword(user.password);
    return this.userService.create(user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@GetUser() user, @Body() credential: CredentialsDto) {
    return this.authService.login(user);
  }
}
