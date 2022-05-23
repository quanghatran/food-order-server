import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoryProduct } from './category-product.entity';
import { Category } from './category.entity';
import { Status } from './status.enum';
import { Store } from './store.entity';
import { OrderItem } from './order-item.entity';
import { Order } from './order.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column('text', { array: true })
  images: string[];

  @Column({ nullable: false })
  description: string;

  @Column({ type: 'decimal' })
  price: number;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: Status;

  @Column({ name: 'bought_num', type: 'int', default: 0 })
  boughtNum: number;

  @Column('uuid', { nullable: false })
  storeId: string;

  @ManyToOne(() => Store, (store) => store.products)
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @OneToMany(
    () => CategoryProduct,
    (categoryProduct) => categoryProduct.product,
  )
  categoryProducts: CategoryProduct[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems!: OrderItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt?: Date;
}
