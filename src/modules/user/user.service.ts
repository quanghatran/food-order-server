import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/repositories';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { User } from '../../entities';
import { MailService } from '../mailer/mailer.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
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
}
