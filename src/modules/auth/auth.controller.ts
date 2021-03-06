import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local.guard';
import { CredentialsDto, PasswordDto } from './dto/credentials.dto';
import { GetUser } from 'src/share/decorators/get-user.decorator';
import { JwtGuard } from './guards/jwt.guard';
import { EmailDto } from './dto/email.dto';
import { CreateStoreDto } from './dto/create-store.dto';
import { StoreService } from '../store/store.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly storeService: StoreService,
  ) {}

  @Post('/user/register')
  async register(@Body() user: CreateUserDto) {
    const checkPhoneNumber =
      (await this.userService.findUserByPhoneNumber(user.phoneNumber)) ||
      (await this.storeService.findUserByPhoneNumber(user.phoneNumber));
    if (checkPhoneNumber) {
      throw new HttpException(
        'Phone number already existed',
        HttpStatus.BAD_REQUEST,
      );
    }

    const checkEmail =
      (await this.userService.findUserByEmail(user.email)) ||
      (await this.storeService.findUserByEmail(user.email));
    if (checkEmail) {
      throw new HttpException('Email already existed', HttpStatus.BAD_REQUEST);
    }
    user.password = await this.authService.hashPassword(user.password);
    const newUser = await this.userService.create(user);
    await this.authService.mailAuthenticateUser(newUser);
    return {
      success: true,
      message:
        'Register successfully, please active account by verify link in your email!',
    };
  }

  @Post('/store/register')
  async registerStore(@Body() store: CreateStoreDto) {
    const checkPhoneNumber =
      (await this.userService.findUserByPhoneNumber(store.phoneNumber)) ||
      (await this.storeService.findUserByPhoneNumber(store.phoneNumber));
    if (checkPhoneNumber) {
      throw new HttpException(
        'Phone number already existed',
        HttpStatus.BAD_REQUEST,
      );
    }

    const checkEmail =
      (await this.userService.findUserByEmail(store.email)) ||
      (await this.storeService.findUserByEmail(store.email));
    if (checkEmail) {
      throw new HttpException('Email already existed', HttpStatus.BAD_REQUEST);
    }

    store.password = await this.authService.hashPassword(store.password);
    const newStore = await this.storeService.create(store);
    await this.authService.mailAuthenticateUser(newStore);
    return {
      success: true,
      message:
        'Register successfully, please active account by verify link in your email!',
    };
  }

  @Post('/reactive')
  async reactive(@Body() email: EmailDto) {
    const user =
      (await this.userService.findUserByEmail(email.email)) ||
      (await this.storeService.findUserByEmail(email.email));
    if (!user || user.isVerify) {
      throw new BadRequestException("Email dosen't exist or already active!");
    }
    await this.authService.mailAuthenticateUser(user);
    return {
      success: true,
      message: 'Please active account by verify link in your email!',
    };
  }

  @Post('/forgot-password')
  async forgot(@Body() email: EmailDto) {
    const user =
      (await this.userService.findUserByEmail(email.email)) ||
      (await this.storeService.findUserByEmail(email.email));
    if (!user || user.isVerify) {
      throw new BadRequestException('Email not exist or already active!');
    }
    await this.authService.mailForgetPassword(user);
    return {
      success: true,
      message: 'Check your mail to reset password!',
    };
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Get('/user/verify')
  async verifyUserAccount(@GetUser() user) {
    await this.userService.activeAccount(user.id);
    return {
      success: true,
    };
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Get('/store/verify')
  async verifyStoreAccount(@GetUser() user) {
    await this.storeService.activeAccount(user.id);
    return {
      success: true,
    };
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Get('/user/reset-password')
  async resetUserAccount(@GetUser() user, @Body() passwordDto: PasswordDto) {
    await this.userService.resetPassword(user.id, passwordDto.password);
    return {
      success: true,
    };
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Get('/store/reset-password')
  async resetStoreAccount(@GetUser() user, @Body() passwordDto: PasswordDto) {
    await this.storeService.resetPassword(user.id, passwordDto.password);
    return {
      success: true,
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@GetUser() user, @Body() credential: CredentialsDto) {
    return this.authService.login(user);
  }
}
