import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CategoryProduct, Discount, Product, Store } from '../../entities';
import { MailService } from '../mailer/mailer.service';
import { StoreRepository } from 'src/repositories/store.repository';
import { CreateStoreDto } from '../auth/dto/create-store.dto';
import * as bcrypt from 'bcrypt';
import { OrderRepository, ProductRepository } from '../../repositories';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { getConnection, In } from 'typeorm';
import { DiscountRepository } from '../../repositories/discount.repository';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { UpdateOrder } from './dto/order.dto';

@Injectable()
export class StoreService {
  constructor(
    private readonly storeRepository: StoreRepository,
    private readonly productRepository: ProductRepository,
    private readonly discountRepository: DiscountRepository,
    private readonly orderRepository: OrderRepository,
    private readonly mailService: MailService,
  ) {}

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
    return updated;
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

  async findStoresByProductIds(productIds: string[]) {
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
    });
    return products.map((product) => product.storeId);
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
}
