import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status } from './status.enum';
import { Store } from './store.entity';

export enum DiscountType {
  PRICE = 'price',
  PERCENT = 'percent',
}

@Entity('discounts')
export class Discount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'enum', enum: ['price', 'percent'], nullable: false })
  discountType: DiscountType;

  @Column({ name: 'discount_percent', type: 'int', nullable: true })
  discountPercent: number;

  @Column({ name: 'discount_price', type: 'decimal', nullable: true })
  discountPrice: number;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: Status;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  start: Date;

  @Column({ type: 'timestamp', nullable: false })
  end: Date;

  @ManyToOne(() => Store, store => store.discounts)
  store: Store;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt?: Date;
}
