import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UserRepository } from 'src/repositories';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import {
  DiscountType,
  Order,
  OrderItem,
  OrderStatus,
  User,
} from '../../entities';
import { MailService } from '../mailer/mailer.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { StoreService } from '../store/store.service';
import { getConnection } from 'typeorm';
import { ProductService } from '../product/product.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
    @Inject(forwardRef(() => StoreService))
    private readonly storeService: StoreService,
    private readonly productService: ProductService,
  ) {}

  async findUserByPhoneNumber(phoneNumber: string) {
    return this.userRepository.findOne({
      where: {
        phoneNumber,
      },
    });
  }

  async findUserByEmail(email: string) {
    return this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  findById(id: string) {
    return this.userRepository.findOne({ id });
  }

  async create(user: CreateUserDto) {
    const newUser = new User();
    newUser.name = user.name;
    newUser.phoneNumber = user.phoneNumber;
    newUser.email = user.email;
    newUser.password = user.password;
    return await this.userRepository.save(newUser);
  }

  async activeAccount(id: string) {
    return this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ isVerify: true })
      .where('id = :id', { id })
      .execute();
  }

  async resetPassword(id: string, password: string) {
    const saltOrRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltOrRounds);
    return this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ password: hashPassword })
      .where('id = :id', { id })
      .execute();
  }

  async getMe(id: string) {
    return this.userRepository.findOne({
      where: {
        id,
      },
      select: [
        'id',
        'address',
        'avatar',
        'email',
        'phoneNumber',
        'role',
        'createdAt',
      ],
    });
  }

  async edit(id: string, data: UpdateUserDto) {
    return this.userRepository.update(
      {
        id,
      },
      { ...data },
    );
  }

  async order(userId, createOrderDto: CreateOrderDto) {
    // check all products in one store
    const productIds = createOrderDto.items.map((item) => item.productId);
    const store = await this.storeService.findStoresByProductIds(productIds);
    if (store.length !== 1)
      throw new BadRequestException(
        'You must be select products in one store per order',
      );

    await getConnection().transaction(async (entityManager) => {
      const newOrder = new Order();
      newOrder.status = OrderStatus.PENDING;
      newOrder.paymentType = createOrderDto.paymentType;
      newOrder.isPayment = false;
      if (createOrderDto.discountId)
        newOrder.discountId = createOrderDto.discountId;
      for (const item of createOrderDto.items) {
        const newItem = new OrderItem();
        newItem.orderId = newOrder.id;
        newItem.productId = item.productId;
        newItem.quantity = item.quantity;
        await entityManager.save(newItem);
      }
      const productItems: OrderItem[] = await entityManager.find(OrderItem, {
        where: {
          orderId: newOrder.id,
        },
      });
      const orderPrices: number[] = productItems.map((productItem) => {
        return productItem.product.price * productItem.quantity;
      });
      let totalPrice: number = orderPrices.reduce((a, b) => a + b);
      if (newOrder.discountId) {
        if ((newOrder.discount.discountType = DiscountType.PRICE)) {
          totalPrice = totalPrice - newOrder.discount.discountPrice;
          totalPrice = totalPrice >= 0 ? totalPrice : 0;
        }
        totalPrice =
          totalPrice - totalPrice * newOrder.discount.discountPercent;
      }
      newOrder.totalPrice = totalPrice;
      await entityManager.save(newOrder);
      return {
        order: newOrder,
        orderItems: productItems,
      };
    });
  }
}
