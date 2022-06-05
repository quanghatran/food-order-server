import { forwardRef, Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mailer/mailer.module';
import { StoreRepository } from 'src/repositories/store.repository';
import {
  NotificationsRepository,
  OrderRepository,
  ProductRepository,
  StoreDetailRepository,
} from '../../repositories';
import { UserModule } from '../user/user.module';
import { DiscountRepository } from '../../repositories/discount.repository';

@Module({
  providers: [StoreService],
  imports: [
    TypeOrmModule.forFeature([
      StoreRepository,
      ProductRepository,
      DiscountRepository,
      OrderRepository,
      StoreDetailRepository,
      NotificationsRepository,
    ]),
    MailModule,
    forwardRef(() => UserModule),
  ],
  controllers: [StoreController],
  exports: [StoreService],
})
export class StoreModule {}
