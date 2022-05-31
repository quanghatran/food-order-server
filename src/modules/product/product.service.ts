import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CategoryRepository,
  ProductRepository,
  StoreRepository,
} from '../../repositories';
import { ILike, In, getConnection } from 'typeorm';
import { GetAllProductDto } from './dto/get-all-product.dto';
import { ProductCaregoryDto } from './dto/product-category.dto';
import { CategoryProductRepository } from 'src/repositories/category-product.repository';
import { ProductStoreDto } from './dto/product-store.dto';
import { OrderItem, Product, Rate, Store } from '../../entities';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly storeRepository: StoreRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly categoryProductRepository: CategoryProductRepository,
  ) {}

  async getAllProduct(data: GetAllProductDto) {
    const page = data.page || 1;
    const perPage = data.perPage || 20;
    const skip = (page - 1) * perPage;
    const filter = data.filter || '';

    const [result, total] = await this.productRepository.findAndCount({
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

  async getProductByCategory(categoryId: string, data: ProductCaregoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(
        `Oh no. Don't have category here. Please check again!`,
      );
    }

    const page = data.page || 1;
    const perPage = data.perPage || 20;
    const skip = (page - 1) * perPage;

    const result = await this.categoryProductRepository.find({
      where: { categoryId: categoryId },
      relations: ['product'],
      order: { createdAt: 'ASC' },
      take: perPage,
      skip: skip,
    });

    return {
      data: result,
    };
  }

  async getProductByStore(storeId: string, data: ProductStoreDto) {
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });
    if (!store) {
      throw new NotFoundException(
        `Oh no. Don't have store here. Please check again!`,
      );
    }

    const page = data.page || 1;
    const perPage = data.perPage || 20;
    const skip = (page - 1) * perPage;

    const result = await this.storeRepository.find({
      where: { storeId: storeId },
      relations: ['products'],
      order: { createdAt: 'ASC' },
      take: perPage,
      skip: skip,
    });

    return {
      data: result,
    };
  }

  async findProductsByProductIds(productIds: string[]) {
    return await this.productRepository.find({
      where: { id: In(productIds) },
    });
  }

  async nearestProduct(address: string) {
    if (!address)
      throw new BadRequestException('Please update address before!');
    const middle = address.split(', ')[1];
    const stores: Store[] = await this.storeRepository
      .createQueryBuilder()
      .select()
      .where('address ILIKE :middle', { middle: `%${middle}%` })
      .getMany();

    const storeIds = stores.map((store) => store.id);
    const products = await this.productRepository.find({
      where: {
        storeId: In(storeIds),
      },
    });
    return products;
  }

  async searchByNameProduct(q: string) {
    return await this.productRepository
      .createQueryBuilder()
      .select()
      .where('name ILIKE :q', { q: `%${q}%` })
      .execute();
  }

  async searchByNameStore(q: string) {
    const stores: Store[] = await this.storeRepository
      .createQueryBuilder()
      .select()
      .where('name ILIKE :q', { q: `%${q}%` })
      .getMany();

    const storeIds = stores.map((store) => store.id);
    const products = await this.productRepository.find({
      where: {
        storeId: In(storeIds),
      },
    });
    return products;
  }

  async search(q: string) {
    const products = await this.searchByNameProduct(q);
    const stores = await this.storeRepository
      .createQueryBuilder()
      .select()
      .where('name ILIKE :q', { q: `%${q}%` })
      .getMany();
    return { stores, products };
  }

  async getProductDetails(productId: string) {
    return getConnection().transaction(async (entityManager) => {
      const product = await entityManager.find(Product, {
        where: {
          id: productId,
        },
      });

      const orders = await entityManager.find(OrderItem, {
        where: {
          productId: productId,
        },
        relations: ['order'],
        select: ['order'],
      });

      const orderIds = orders.map((order) => order.order.id);
      const rates = await entityManager.find(Rate, {
        where: {
          orderId: In(orderIds),
        },
      });
      return { product, rates };
    });
  }
}
