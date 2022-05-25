import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Order } from './order.entity';

@Entity('order_item')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, default: 1 })
  quantity: number;

  @Column()
  orderId!: string;

  @Column()
  productId!: string;

  @ManyToOne(() => Order, (order) => order.orderItems)
  order!: Order;

  @ManyToOne(() => Product, (product) => product.orderItems)
  product!: Product;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt?: Date;
}
