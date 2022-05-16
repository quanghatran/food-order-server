import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { Store, User } from '../../entities';
import { MailService } from '../mailer/mailer.service';
import { StoreRepository } from 'src/repositories/store.repository';
import { CreateStoreDto } from '../auth/dto/create-store.dto';

@Injectable()
export class StoreService {
  constructor(
    private readonly storeRepository: StoreRepository,
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
    console.log(id);

    return this.storeRepository
      .createQueryBuilder()
      .update(Store)
      .set({ isVerify: true })
      .where('id = :id', { id })
      .execute();
  }
}
