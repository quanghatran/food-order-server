import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('rates')
export class Rate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float' })
  star: number;

  @Column({ nullable: true })
  content: string;

  @Column('text', { array: true, nullable: true })
  images: string[];

  @Column('uuid', { nullable: false })
  orderId: string;

  @OneToOne(() => Order)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt?: Date;
}
