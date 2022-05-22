import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../../repositories/category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from '../../entities';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  createCategory(cate: CreateCategoryDto) {
    const newCategory = new Category();
    newCategory.name = cate.name;
    return this.categoryRepository.save(newCategory);
  }

  findAll() {
    return this.categoryRepository.find({});
  }

  edit(id: string, createCategoryDto: CreateCategoryDto) {
    return this.categoryRepository.update(
      {
        id,
      },
      {
        name: createCategoryDto.name,
      },
    );
  }
}
