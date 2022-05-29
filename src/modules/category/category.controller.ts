import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Roles } from '../../share/decorators/roles.decorator';
import { Role } from '../../entities';
import { RolesGuard } from '../../share/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../../share/multer/multer-config';
import uploadImage from '../../share/multer/uploader';
import { GetAllCategoryDto } from './dto/get-all-category.dto';

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('/')
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          nullable: false,
        },
        name: { type: 'string', nullable: false },
      },
    },
  })
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async create(@Body() cate: CreateCategoryDto, @UploadedFile() image) {
    const linkImage = await uploadImage(image.path);
    return this.categoryService.createCategory(cate, linkImage);
  }

  @Get('/all-category')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @UseGuards(JwtGuard)
  getAll(@Query() data: GetAllCategoryDto) {
    return this.categoryService.getAll(data);
  }

  @Patch('/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          nullable: true,
        },
        name: { type: 'string', nullable: true },
      },
    },
  })
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @UseGuards(JwtGuard)
  async edit(
    @Param('id') id: string,
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() image,
  ) {
    const link = image ? await uploadImage(image) : '';
    return this.categoryService.edit(id, createCategoryDto, link);
  }

  @Delete('/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @UseGuards(JwtGuard)
  delete(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}
