import { UserService } from './user.service';
import {
  Body,
  Controller,
  Get,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from 'src/share/decorators/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Get('/info')
  getInfo(@GetUser() user) {
    return this.userService.getMe(user.id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Patch('/update')
  async update(@GetUser() user, @Body() data: UpdateUserDto) {
    await this.userService.edit(user.id, data);
    return {
      success: true,
    };
  }
}
