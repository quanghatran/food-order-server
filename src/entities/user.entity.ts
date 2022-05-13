import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Order } from './order.entity';
import { Notification } from './notifycation.entity';

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({
    default:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRN4XHueiGRgx5W0Rw7LOdyRH0smvIvbg6eSQ&usqp=CAU',
  })
  avatar: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ name: 'phone_number', nullable: false })
  phoneNumber: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
  role: Role;

  @Column({ name: 'is_verify', default: false })
  isVerify: boolean;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt?: Date;
}
