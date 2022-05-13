import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/repositories';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { User } from '../../entities';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

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
}
