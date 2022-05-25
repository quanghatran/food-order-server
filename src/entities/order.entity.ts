import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Discount } from './discount.entity';
import { User } from './user.entity';
import { Store } from './store.entity';
import { OrderItem } from './order-item.entity';
import { Conversation } from './coversation.entity';

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

  @Column('uuid', { nullable: false })
  discountId: string;

  @ManyToOne(() => Discount, (discount) => discount.orders)
  @JoinColumn({ name: 'discountId' })
  discount: Discount;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @ManyToOne(() => Store, (store) => store.orders)
  store: Store;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems!: OrderItem[];

  @OneToMany(() => Conversation, (conversation) => conversation.order)
  conversations: Conversation[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt?: Date;
}
