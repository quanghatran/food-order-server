import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRM = 'confirm',
  SUCCESS = 'success',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export enum PaymentType {
  CASH = 'cash',
  CREDIT_CASH = 'credit_cash',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirm', 'success', 'cancelled', 'failed'],
    default: 'pending',
  })
  status: OrderStatus;

  @Column({
    name: 'payment_type',
    type: 'enum',
    enum: ['cash', 'credit_cash'],
    nullable: false,
  })
  paymentType: PaymentType;

  @Column({ name: 'is_payment', default: false })
  isPayment: boolean;

  @Column({
    name: 'paymented_at',
    nullable: false,
    type: 'timestamptz',
  })
  paymentedAt: Date;

  @Column({ name: 'total_price', type: 'decimal' })
  totalPrice: number;

  @Column({ name: 'time_receive', type: 'timestamptz' })
  timeReceive: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt?: Date;
}
