import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../../repositories/user.repository';

@Module({
  providers: [UserService],
  imports: [TypeOrmModule.forFeature([UserRepository])],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
