import { StoreService } from './store.service';
import {
  Body,
  Controller,
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
import { ApiMultiFile } from '../../share/swagger/swagger-decorators';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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
        },
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
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
    const newProduct = await this.storeService.addProduct(
      user.id,
      createProductDto,
      linksImage,
    );
    delete newProduct.store;
    return newProduct;
  }

  @Patch('/product/:productId')
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
        },
        name: { type: 'string', nullable: true },
        description: { type: 'string', nullable: true },
        price: { type: 'number', nullable: true },
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
}
