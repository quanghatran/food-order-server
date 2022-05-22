import { Injectable } from '@nestjs/common';
import { Product, Store } from '../../entities';
import { MailService } from '../mailer/mailer.service';
import { StoreRepository } from 'src/repositories/store.repository';
import { CreateStoreDto } from '../auth/dto/create-store.dto';
import * as bcrypt from 'bcrypt';
import { ProductRepository } from '../../repositories';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class StoreService {
  constructor(
    private readonly storeRepository: StoreRepository,
    private readonly productRepository: ProductRepository,
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
    const store = await this.storeRepository.findOne({ id: storeId });
    const newProduct = new Product();
    newProduct.name = createProductDto.name;
    newProduct.images = images;
    newProduct.description = createProductDto.description;
    newProduct.price = createProductDto.price;
    newProduct.store = store;
    return this.productRepository.save(newProduct);
  }

  async updateProduct(
    storeId: string,
    productId: string,
    updateProductDto?: UpdateProductDto,
    linkImages?: string[],
  ) {
    const product = await this.productRepository.findOne({
      where: {
        id: productId,
      },
      // select: ['storeId'],
    });
    console.log(product);
    const store = product.store;
    console.log(store);
    return 1;
  }
}
