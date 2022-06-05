import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CategoryProduct,
  OrderStatus,
  Product,
  Status,
  Store,
  StoreDetail,
} from '../../entities';
import { MailService } from '../mailer/mailer.service';
import { StoreRepository } from 'src/repositories/store.repository';
import { CreateStoreDto } from '../auth/dto/create-store.dto';
import * as bcrypt from 'bcrypt';
import {
  NotificationsRepository,
  OrderRepository,
  ProductRepository,
  StoreDetailRepository,
} from '../../repositories';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { getConnection, In, MoreThan } from 'typeorm';
import { DiscountRepository } from '../../repositories/discount.repository';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { PaginationDto, UpdateOrder } from './dto/order.dto';
import { UpdateStoreDto } from './dto/store.dto';
import { Cron, Interval } from '@nestjs/schedule';

@Injectable()
export class StoreService {
  constructor(
    private readonly storeRepository: StoreRepository,
    private readonly productRepository: ProductRepository,
    private readonly discountRepository: DiscountRepository,
    private readonly orderRepository: OrderRepository,
    private readonly storeDetailRepository: StoreDetailRepository,
    private readonly notificationsRepository: NotificationsRepository,
    private readonly mailService: MailService,
  ) {}

  async getStores() {
    return this.storeRepository.find({
      where: { isVerify: true },
      select: [
        'id',
        'name',
        'email',
        'phoneNumber',
        'address',
        'images',
        'status',
        'star',
        'timeOpen',
        'timeClose',
      ],
    });
  }

  async findUserByPhoneNumber(phoneNumber: string) {
    return this.storeRepository.findOne({
      where: {
        phoneNumber,
      },
    });
  }

  async findUserByEmail(email: string) {
    return this.storeRepository.findOne({
      where: {
        email,
      },
    });
  }

  findStore(id: string) {
    return this.storeRepository.findOne({ where: { id } });
  }

  async create(store: CreateStoreDto) {
    const newStore = new Store();
    newStore.name = store.name;
    newStore.phoneNumber = store.phoneNumber;
    newStore.email = store.email;
    newStore.password = store.password;
    newStore.address = store.address;
    return await this.storeRepository.save(newStore);
  }

  async activeAccount(id: string) {
    return this.storeRepository
      .createQueryBuilder()
      .update(Store)
      .set({ isVerify: true })
      .where('id = :id', { id })
      .execute();
  }

  async resetPassword(id: string, password: string) {
    const saltOrRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltOrRounds);
    return this.storeRepository
      .createQueryBuilder()
      .update(Store)
      .set({ password: hashPassword })
      .where('id = :id', { id })
      .execute();
  }

  getOwnerProduct(id: string) {
    return this.productRepository.find({ where: { store: id } });
  }

  async addProduct(
    storeId: string,
    createProductDto: CreateProductDto,
    images: string[],
  ) {
    const newProduct = new Product();
    newProduct.name = createProductDto.name;
    newProduct.images = images;
    newProduct.description = createProductDto.description;
    newProduct.price = createProductDto.price;
    newProduct.storeId = storeId;
    await getConnection().transaction(async (entityManager) => {
      await entityManager.save(newProduct);
      for (const categoryId of createProductDto.categories) {
        const categoryProduct = new CategoryProduct();
        categoryProduct.productId = newProduct.id;
        categoryProduct.categoryId = categoryId;
        await entityManager.save(categoryProduct);
      }
    });
    return newProduct;
  }

  async updateProduct(
    storeId: string,
    productId: string,
    updateProductDto?: UpdateProductDto,
    images?: string[],
  ) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) throw new BadRequestException('Product not found');
    if (product.storeId !== storeId) {
      throw new UnauthorizedException('You can update your products');
    }
    const updated =
      images.length > 0
        ? await this.productRepository.update(
            { id: productId },
            { ...updateProductDto, images },
          )
        : await this.productRepository.update(
            { id: productId },
            { ...updateProductDto },
          );
    return this.productRepository.findOne({ id: productId });
  }

  async deleteProduct(productId: string, storeId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) throw new BadRequestException('Product not found');
    if (product.storeId !== storeId) {
      throw new UnauthorizedException('You can update your products');
    }
    return this.productRepository.delete({ id: productId });
  }

  async getDiscounts(storeId: string) {
    return this.discountRepository.find({
      where: {
        storeId,
      },
    });
  }

  async addDiscount(storeId: string, createDiscountDto: CreateDiscountDto) {
    const discount = await this.discountRepository.create({
      ...createDiscountDto,
      storeId,
    });
    await this.discountRepository.save(discount);
    return discount;
  }

  async editDiscount(
    storeId: string,
    discountId: string,
    updateDiscountDto: UpdateDiscountDto,
  ) {
    const discount = await this.discountRepository.findOne({
      id: discountId,
    });
    if (!discount || discount.storeId !== storeId)
      throw new BadRequestException(
        'Discount is not exist or it not not owned by you',
      );
    return this.discountRepository.update(
      {
        id: discountId,
        storeId,
      },
      {
        ...updateDiscountDto,
      },
    );
  }

  async deleteDiscount(storeId: string, discountId: string) {
    const discount = await this.discountRepository.findOne({
      id: discountId,
    });
    if (!discount || discount.storeId !== storeId)
      throw new BadRequestException(
        'Discount is not exist or it not not owned by you',
      );
    return this.discountRepository.delete({ id: discountId });
  }

  async findStoresByProductIds(productIds: string[]) {
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
    });
    return products.map((product) => product.storeId);
  }

  async getOrders(storeId: string, pagination: PaginationDto) {
    const { page = 1, perPage = 20 } = pagination;
    return this.orderRepository.find({
      where: {
        storeId: storeId,
      },
      take: perPage,
      skip: perPage * (page - 1),
      order: {
        id: 'DESC',
      },
    });
  }

  async updateOrder(
    storeId: string,
    orderId: string,
    updateOrder: UpdateOrder,
  ) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (order.storeId !== storeId) {
      throw new UnauthorizedException('You just can update your order');
    }
    return this.orderRepository.update({ id: orderId }, { ...updateOrder });
  }

  async updateStore(
    storeId: string,
    updateStoreDto: UpdateStoreDto,
    images: string[],
  ) {
    return images.length > 0
      ? this.storeRepository.update(
          { id: storeId },
          { ...updateStoreDto, images },
        )
      : this.storeRepository.update(
          { id: storeId },
          { ...updateStoreDto, images },
        );
  }

  async editStoreStatus(storeId: string, status: Status) {
    return this.storeRepository.update({ id: storeId }, { status });
  }

  async deleteStore(storeId: string) {
    return this.storeRepository.delete({ id: storeId });
  }

  @Cron('0 0 1 * *')
  async calculateStoreDetails() {
    const stores = await this.storeRepository.find({
      where: {},
      select: ['id'],
    });

    const storeIds = stores.map((store) => store.id);
    console.log(storeIds);
    for (const storeId of storeIds) {
      // calculate num order
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);

      const filters = {
        storeId,
        before: lastDay.toISOString() as any,
        after: firstDay.toISOString() as any,
      };
      const orders = await this.orderRepository
        .createQueryBuilder('order')
        .select()
        .where('order.storeId = :storeId')
        .andWhere('order.createdAt >= :after')
        .andWhere('order.createdAt < :before')
        .setParameters(filters)
        .getMany();
      let numOrder = 0;
      let numOrderSuccess = 0;
      let numOrderFail = 0;
      let totalMoney = 0;
      const isPayment = false;
      orders.forEach((order) => {
        numOrder += 1;
        if (order.status === OrderStatus.SUCCESS) {
          numOrderSuccess += 1;
          totalMoney += Number(order.totalPrice);
        }
        if (order.status === OrderStatus.FAILED) {
          numOrderFail += 1;
        }
      });
      const storeDetails = new StoreDetail();
      storeDetails.numOrder = numOrder;
      storeDetails.numOrderSuccess = numOrderSuccess;
      storeDetails.numOrderFail = numOrderFail;
      storeDetails.totalMoney = totalMoney;
      storeDetails.isPayment = isPayment;
      storeDetails.storeId = storeId;
      await this.storeDetailRepository.save(storeDetails);
    }
  }

  @Cron('0 8,20 1,2,3,4,5 * *')
  async sendMailToStoreNotPayment() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 0);
    const storeDetails = await this.storeDetailRepository.find({
      where: {
        isPayment: false,
        createdAt: MoreThan(firstDay),
      },
      relations: ['store'],
    });

    for (const storeDetail of storeDetails) {
      const money = storeDetail.totalMoney / 10;
      const content = `Please pay ${money} fee for this month before 5th day`;
      await this.mailService.sendMail(storeDetail.store.email, content);
    }
  }

  @Cron('0 0 6,7,8,9,10 * *')
  async banStoreNotPayment() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 0);
    const storeDetails = await this.storeDetailRepository.find({
      where: {
        isPayment: false,
        createdAt: MoreThan(firstDay),
      },
      relations: ['store'],
    });

    for (const storeDetail of storeDetails) {
      const money = (storeDetail.totalMoney / 100) * 20;
      const content = `Sorry, your store was ban, pay ${money} fee to us and contact to admin to unban`;
      await this.storeRepository.update(
        { id: storeDetail.storeId },
        {
          status: Status.INACTIVE,
        },
      );
      await this.mailService.sendMail(storeDetail.store.email, content);
    }
  }
}
