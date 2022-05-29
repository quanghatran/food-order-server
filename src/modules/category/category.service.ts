import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../../repositories/category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from '../../entities';
import { GetAllCategoryDto } from './dto/get-all-category.dto';
import { ILike } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  createCategory(cate: CreateCategoryDto, image: string) {
    const newCategory = new Category();
    newCategory.name = cate.name;
    newCategory.image = image;
    return this.categoryRepository.save(newCategory);
  }

  async getAll(data: GetAllCategoryDto) {
    const page = data.page || 1;
    const perPage = data.perPage || 20;
    const skip = (page - 1) * perPage;
    const filter = data.filter || '';

    const [result, total] = await this.categoryRepository.findAndCount({
      where: { name: ILike(`%${filter}%`) },
      order: { name: 'ASC' },
      take: perPage,
      skip: skip,
    });

    return {
      data: result,
      count: total,
    };
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
