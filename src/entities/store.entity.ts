import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Discount } from './discount.entity';
import { Product } from './product.entity';
import { Status } from './status.enum';
import { Order } from './order.entity';
import { Notification } from './notifycation.entity';
import { StoreDetail } from './store-detail.entity';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ name: 'phone_number', unique: true })
  phoneNumber: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false })
  address: string;

  @Column('text', { array: true, nullable: true })
  images: string[];

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: Status;

  @Column({ type: 'float', default: 0 })
  star: number;

  @Column({ name: 'rate_count', type: 'int', default: 0 })
  rateCount: number;

  @Column({ type: 'varchar', nullable: true, name: 'time_open' })
  timeOpen: string;

  @Column({ type: 'varchar', nullable: true, name: 'time_close' })
  timeClose: string;

  @Column({ name: 'is_verify', default: false })
  isVerify: boolean;

  @OneToMany(() => Product, (product) => product.store)
  products: Product[];

  @OneToMany(() => Discount, (discount) => discount.store)
  discounts: Discount[];

  @OneToMany(() => Order, (order) => order.store)
  orders: Order[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => StoreDetail, (storeDetail) => storeDetail.store)
  details: StoreDetail[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt?: Date;
}
