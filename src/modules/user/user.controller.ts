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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
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
import uploadImage from '../../share/multer/uploader';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../../share/multer/multer-config';

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
  getAllUser(@Query() getAllUserDto: GetAllUserDto) {
    return this.userService.getAllUser(getAllUserDto);
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


  @Get('/discount/:storeId')
  getDisCountOfStore(@Param('storeId') storeId: string) {
    return this.userService.getDisCountOfStore(storeId);
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
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions))
  @Post('/order/rating/:orderId')
  async ratingOrder(
    @GetUser() user,
    @Param('orderId') orderId: string,
    @Body() ratingOrderDto: RatingOrderDto,
    @UploadedFiles() images,
  ) {
    const linksImage = [];
    for (const image of images) {
      const link = await uploadImage(image.path);
      linksImage.push(link);
    }
    return await this.userService.ratingOrder(
      user.id,
      orderId,
      ratingOrderDto,
      linksImage,
    );
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'get history orders' })
  @UseGuards(JwtGuard)
  @Get('/order/history')
  async historyOrder(@GetUser() user) {
    return this.userService.historyOrder(user.id);
  }

  @Delete('/delete/:userId')
  @ApiBearerAuth('Jwt-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @UseGuards(JwtGuard)
  async delete(@Param('userId') userId: string) {
    return this.userService.deleteUser(userId);
  }
}
