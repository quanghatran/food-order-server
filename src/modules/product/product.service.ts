import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductRepository, StoreRepository } from '../../repositories';
import { Store } from '../../entities';
import { In } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly storeRepository: StoreRepository,
  ) {}

  getAllProduct() {
    return this.productRepository.find();
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
}
