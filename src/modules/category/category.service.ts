import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../../repositories/category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from '../../entities';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  createCategory(cate: CreateCategoryDto, image: string) {
    const newCategory = new Category();
    newCategory.name = cate.name;
    newCategory.image = image;
    return this.categoryRepository.save(newCategory);
  }

  findAll() {
    return this.categoryRepository.find({});
  }

  edit(id: string, createCategoryDto: CreateCategoryDto, image: string) {
    return image !== ''
      ? this.categoryRepository.update(
          {
            id,
          },
          {
            name: createCategoryDto.name,
            image,
          },
        )
      : this.categoryRepository.update(
          {
            id,
          },
          {
            name: createCategoryDto.name,
            image,
          },
        );
  }

  delete(id: string) {
    return this.categoryRepository.delete({ id });
  }
}
