import { UserService } from './user.service';
import {
  Body,
  Controller,
  Get,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from 'src/share/decorators/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ProductService } from '../product/product.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly productService: ProductService,
  ) {}

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

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({summary: 'get products nearest with address of user'})
  @UseGuards(JwtGuard)
  @Get('/product/nearest')
  async getNearestProduct(@GetUser() user) {
    const userProfile = await this.userService.findById(user.id);
    const address = userProfile.address;
    return this.productService.nearestProduct(address);
  }
}
