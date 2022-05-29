import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CategoryRepository,
  ProductRepository,
  StoreRepository,
} from '../../repositories';
import { CategoryModule } from '../category/category.module';
import { CategoryProductRepository } from 'src/repositories/category-product.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductRepository,
      StoreRepository,
      CategoryProductRepository,
      CategoryRepository,
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
