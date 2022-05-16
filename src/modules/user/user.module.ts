import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../../repositories/user.repository';
import { MailModule } from '../mailer/mailer.module';

@Module({
  providers: [UserService],
  imports: [TypeOrmModule.forFeature([UserRepository]), MailModule],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
