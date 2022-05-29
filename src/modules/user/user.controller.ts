import { UserService } from './user.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from 'src/share/decorators/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ProductService } from '../product/product.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { RatingOrderDto } from './dto/order.dto';
import { RolesGuard } from 'src/share/guards/roles.guard';
import { Roles } from 'src/share/decorators/roles.decorator';
import { Role } from 'src/entities';
import { GetAllUserDto } from './dto/get-all-user.dto';

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
  
  @Get('/all-user')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @UseGuards(JwtGuard)
  getAllUser(@Query() data: GetAllUserDto) {
    return this.userService.getAllUser(data)
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
  @ApiOperation({ summary: 'get products nearest with address of user' })
  @UseGuards(JwtGuard)
  @Get('/product/nearest')
  async getNearestProduct(@GetUser() user) {
    const userProfile = await this.userService.findById(user.id);
    const address = userProfile.address;
    return this.productService.nearestProduct(address);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'order products' })
  @UseGuards(JwtGuard)
  @Post('/order')
  async order(@GetUser() user, @Body() createOrderDto: CreateOrderDto) {
    const userProfile = await this.userService.findById(user.id);
    const address = userProfile.address;
    const res = await this.userService.order(user.id, createOrderDto);
    return res;
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'cancel order' })
  @UseGuards(JwtGuard)
  @Patch('/order/:orderId')
  async cancelOrder(@GetUser() user, @Param('orderId') orderId: string) {
    await this.userService.cancelOrder(user.id, orderId);
    return {
      success: true,
      message: 'cancel order successfully',
    };
  }

  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'rating order' })
  @ApiBody({
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          nullable: true,
        },
        content: { type: 'string', nullable: false },
        star: { type: 'number', nullable: false },
      },
    },
  })
  @UseGuards(JwtGuard)
  @Post('/order/:orderId')
  async ratingOrder(
    @GetUser() user,
    @Param('orderId') orderId: string,
    @Body() ratingOrderDto: RatingOrderDto,
  ) {
    await this.userService.cancelOrder(user.id, orderId);
    return {
      success: true,
      message: 'cancel order successfully',
    };
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'get history orders' })
  @UseGuards(JwtGuard)
  @Get('/order/history')
  async historyOrder(@GetUser() user) {
    return this.userService.historyOrder(user.id);
  }
}
