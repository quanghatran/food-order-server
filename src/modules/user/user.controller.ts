import { UserService } from './user.service';
import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from 'src/share/decorators/get-user.decorator';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Get('/info')
  getInfo(@GetUser() user) {
    return user;
  }
}
