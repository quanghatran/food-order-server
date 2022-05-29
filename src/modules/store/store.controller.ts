import { StoreService } from './store.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from 'src/share/decorators/get-user.decorator';
import { Roles } from '../../share/decorators/roles.decorator';
import { Role } from '../../entities';
import { RolesGuard } from '../../share/guards/roles.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../../share/multer/multer-config';
import uploadImage from '../../share/multer/uploader';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { UpdateOrder } from './dto/order.dto';

@ApiTags('Store')
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Get('/info')
  getInfo(@GetUser() user) {
    return user;
  }

  @Get('/get-owner-products')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.Store)
  @UseGuards(JwtGuard)
  getOwnProduct(@GetUser() user) {
    return this.storeService.getOwnerProduct(user.id);
  }

  @Post('/add-product')
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          nullable: false,
        },
        name: { type: 'string', nullable: false },
        description: { type: 'string', nullable: false },
        price: { type: 'number', nullable: false },
        categories: {
          type: 'array',
          items: {
            type: 'string',
          },
          nullable: false,
          description:
            'Cái swagger này lỗi array, e chưa thấy fix kiểu gì. Dùng postman cái này nha a',
        },
      },
    },
  })
  @UseGuards(RolesGuard)
  @Roles(Role.Store)
  @UseGuards(JwtGuard)
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions))
  async addProduct(
    @UploadedFiles() images,
    @Body() createProductDto: CreateProductDto,
    @GetUser() user,
  ) {
    const linksImage = [];
    for (const image of images) {
      const link = await uploadImage(image.path);
      linksImage.push(link);
    }
    console.log(createProductDto);
    return await this.storeService.addProduct(
      user.id,
      createProductDto,
      linksImage,
    );
  }

  @Patch('/product/:productId')
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
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
        name: { type: 'string', nullable: true },
        description: { type: 'string', nullable: true },
        price: { type: 'number', nullable: true },
        status: { enum: ['active', 'inactive'], nullable: true },
      },
    },
  })
  @UseGuards(RolesGuard)
  @Roles(Role.Store)
  @UseGuards(JwtGuard)
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions))
  async editProduct(
    @UploadedFiles() images,
    @Param('productId') productId: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user,
  ) {
    const linksImage = [];
    for (const image of images) {
      const link = await uploadImage(image.path);
      linksImage.push(link);
    }
    return this.storeService.updateProduct(
      user.id,
      productId,
      updateProductDto,
      linksImage,
    );
  }

  @Delete('/product/:productId')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.Store)
  @UseGuards(JwtGuard)
  deleteProduct(@Param('productId') productId: string, @GetUser() user) {
    return this.storeService.deleteProduct(productId, user.id);
  }

  @Post('/discount/create')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.Store)
  @UseGuards(JwtGuard)
  createDiscount(
    @Body() createDiscountDto: CreateDiscountDto,
    @GetUser() user,
  ) {
    return this.storeService.addDiscount(user.id, createDiscountDto);
  }

  @Patch('/discount/update/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.Store)
  @UseGuards(JwtGuard)
  updateDiscount(
    @Param('id') id: string,
    @Body() updateDiscountDto: UpdateDiscountDto,
    @GetUser() user,
  ) {
    return this.storeService.editDiscount(user.id, id, updateDiscountDto);
  }

  @Patch('/order/update/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.Store)
  @UseGuards(JwtGuard)
  async updateOrder(
    @Param('id') id: string,
    @Body() updateOrder: UpdateOrder,
    @GetUser() user,
  ) {
    await this.storeService.updateOrder(user.id, id, updateOrder);
    return {
      success: true,
      message: 'update order successfully!',
    };
  }
}
