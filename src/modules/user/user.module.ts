import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../../repositories/user.repository';
import { MailModule } from '../mailer/mailer.module';
import { ProductModule } from '../product/product.module';
import { StoreModule } from '../store/store.module';
import { DiscountRepository } from '../../repositories/discount.repository';
import {
  NotificationsRepository,
  OrderRepository,
  StoreDetailRepository,
} from '../../repositories';

@Module({
  providers: [UserService],
  imports: [
    TypeOrmModule.forFeature([
      UserRepository,
      DiscountRepository,
      OrderRepository,
      StoreDetailRepository,
      NotificationsRepository,
    ]),
    MailModule,
    ProductModule,
    forwardRef(() => StoreModule),
  ],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
