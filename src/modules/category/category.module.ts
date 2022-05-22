import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryRepository } from '../../repositories/category.repository';
import { UserModule } from '../user/user.module';
import { StoreModule } from '../store/store.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryRepository]),
    UserModule,
    StoreModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
