import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Roles } from '../../share/decorators/roles.decorator';
import { Role } from '../../entities';
import { RolesGuard } from '../../share/guards/roles.guard';

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('/')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @UseGuards(JwtGuard)
  create(@Body() cate: CreateCategoryDto) {
    return this.categoryService.createCategory(cate);
  }

  @Get('/')
  getAll() {
    return this.categoryService.findAll();
  }

  @Patch('/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @UseGuards(JwtGuard)
  edit(@Param('id') id: string, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.edit(id, createCategoryDto);
  }
}
