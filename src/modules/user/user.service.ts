import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/repositories';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { User } from '../../entities';
import { MailService } from '../mailer/mailer.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
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

  async create(user: CreateUserDto) {
    const newUser = new User();
    newUser.name = user.name;
    newUser.phoneNumber = user.phoneNumber;
    newUser.email = user.email;
    newUser.password = user.password;
    return await this.userRepository.save(newUser);
  }

  async activeAccount(id: string) {
    console.log(id);

    return this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ isVerify: true })
      .where('id = :id', { id })
      .execute();
  }
}
