import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Store } from './store.entity';

// save store details per month for calculate ...
@Entity('store_details')
export class StoreDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'num_order', type: 'int', default: 0 })
  numOrder: number;

  @Column({ name: 'num_order_success', type: 'int', default: 0 })
  numOrderSuccess: number;

  @Column({ name: 'num_order_fail', type: 'int', default: 0 })
  numOrderFail: number;

  @Column({ name: 'total_money', type: 'decimal' })
  totalMoney: number;

  @Column({ name: 'is_payment', default: false })
  isPayment: boolean;

  @ManyToOne(() => Store, (store) => store.details)
  store: Store;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt?: Date;
}
