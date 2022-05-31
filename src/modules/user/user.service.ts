import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderRepository, UserRepository } from 'src/repositories';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import {
  Discount,
  DiscountType,
  Order,
  OrderItem,
  OrderStatus,
  Rate,
  Status,
  User,
} from '../../entities';
import { MailService } from '../mailer/mailer.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { StoreService } from '../store/store.service';
import { GetAllUserDto } from './dto/get-all-user.dto';
import { EntityManager, getConnection, ILike, MoreThan } from 'typeorm';
import { ProductService } from '../product/product.service';
import { DiscountRepository } from '../../repositories/discount.repository';
import { RatingOrderDto } from './dto/order.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly discountRepository: DiscountRepository,
    private readonly orderRepository: OrderRepository,
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

  deleteUser(id) {
    return this.userRepository.delete({ id });
  }

  async create(user: CreateUserDto) {
    const newUser = new User();
    newUser.name = user.name;
    newUser.phoneNumber = user.phoneNumber;
    newUser.email = user.email;
    newUser.password = user.password;
    return await this.userRepository.save(newUser);
  }

  async getAllUser(data: GetAllUserDto) {
    const page = data.page || 1;
    const perPage = data.perPage || 20;
    const skip = (page - 1) * perPage;
    const filter = data.filter || '';

    const [result, total] = await this.userRepository.findAndCount({
      where: { name: ILike(`%${filter}%`) },
      order: { name: 'ASC' },
      take: perPage,
      skip: skip,
    });

    return {
      data: result,
      count: total,
    };
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

  async getDisCountOfStore(storeId: string) {
    return this.discountRepository.find({
      where: {
        storeId,
        status: Status.ACTIVE,
        end: MoreThan(new Date()),
      },
    });
  }

  async order(userId: string, createOrderDto: CreateOrderDto) {
    // check all products in one store
    const productIds = createOrderDto.items.map((item) => item.productId);
    let store = await this.storeService.findStoresByProductIds(productIds);
    let discount: Discount;

    store = [...new Set(store)];
    if (store.length !== 1)
      throw new BadRequestException(
        'You must be select products in one store per order',
      );

    const result = await getConnection().transaction(async (entityManager) => {
      const newOrder = new Order();
      newOrder.status = OrderStatus.PENDING;
      newOrder.paymentType = createOrderDto.paymentType;
      newOrder.isPayment = false;
      newOrder.userId = userId;
      newOrder.timeReceive = createOrderDto.timeReceive;
      newOrder.storeId = store[0];
      if (createOrderDto.discountId) {
        discount = await this.discountRepository.findOne({
          where: { id: createOrderDto.discountId },
        });
        if (!discount)
          throw new BadRequestException('discount dose not exist!');
        newOrder.discountId = createOrderDto.discountId;
      }
      await entityManager.save(newOrder);

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
        relations: ['product'],
      });
      const orderPrices: number[] = productItems.map((productItem) => {
        if (productItem.product.status === Status.INACTIVE) {
          throw new BadRequestException(
            `product ${productItem.product.name} inactive`,
          );
        }
        return productItem.product.price * productItem.quantity;
      });
      let totalPrice: number = orderPrices.reduce((a, b) => a + b);
      if (discount) {
        if ((discount.discountType = DiscountType.PRICE)) {
          totalPrice = totalPrice - discount.discountPrice;
          totalPrice = totalPrice >= 0 ? totalPrice : 0;
        }
        totalPrice = totalPrice - totalPrice * discount.discountPercent;
      }
      newOrder.totalPrice = totalPrice;
      await entityManager.save(newOrder);
      return {
        order: newOrder,
        orderItems: productItems,
      };
    });
    return result;
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (orderId !== order.id) {
      throw new BadRequestException("Can't cancel order of other! ");
    }
    return this.orderRepository.update(
      { id: orderId },
      {
        status: OrderStatus.CANCELLED,
      },
    );
  }

  async historyOrder(userId: string) {
    return this.orderRepository.find({
      where: {
        userId,
      },
    });
  }

  async ratingOrder(
    userId: string,
    orderId: string,
    rating: RatingOrderDto,
    images?: string[],
  ) {
    const result = await getConnection().transaction(
      async (entityManager: EntityManager) => {
        const order = await entityManager.findOne(Order, {
          where: {
            id: orderId,
          },
          relations: ['store'],
        });
        if (!order) {
          throw new NotFoundException('Order not found');
        }
        if (orderId !== order.id) {
          throw new BadRequestException("Can't rate order of other user! ");
        }
        if (order.status !== OrderStatus.SUCCESS)
          throw new BadRequestException('Can not rating pending order');
        const store = order.store;

        const rate = new Rate();
        rate.orderId = orderId;
        rate.star = rating.star;
        rate.content = rating.content;
        if (images?.length > 0) rate.images = images;
        try {
          await entityManager.save(rate);
        } catch (e) {
          throw new BadRequestException('You must be rate order once');
        }

        // calculate new star of store
        store.rateCount += 1;
        store.star =
          (store.star * (store.rateCount - 1) + rating.star) / store.rateCount;
        await entityManager.save(store);
        return rate;
      },
    );
    return result;
  }
}
