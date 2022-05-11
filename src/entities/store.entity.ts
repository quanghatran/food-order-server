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

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column()
  password: string;

  @Column({ nullable: false })
  address: string;

  @Column('text', { array: true })
  images: string[];

  @Column({ type: 'enum', enum: ['actice', 'inactive'], default: 'inactive' })
  status: Status;

  @Column({ type: 'float', default: 0 })
  star: number;

  @Column({ type: 'time', nullable: false, name: 'time_open' })
  timeOpen: Date;

  @Column({ type: 'time', nullable: false, name: 'time_close' })
  timeClose: Date;

  @Column({ name: 'is_verify', default: false })
  isVerify: boolean;

  @OneToMany(() => Product, (product) => product.store)
  products: Product[];

  @OneToMany(() => Discount, (discount) => discount.store)
  discounts: Discount[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt?: Date;
}
