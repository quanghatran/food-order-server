import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Product } from './product.entity';

@Entity('category_product')
export class CategoryProduct {
  @PrimaryColumn()
  categoryId!: string;

  @PrimaryColumn()
  productId!: string;

  @ManyToOne(() => Category, (category) => category.categoryProducts)
  category!: Category;

  @ManyToOne(() => Product, (product) => product.categoryProducts)
  product!: Product;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt?: Date;
}
