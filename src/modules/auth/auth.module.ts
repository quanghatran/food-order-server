import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import * as config from 'config';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../../repositories/user.repository';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt-strategy';
import { MailModule } from '../mailer/mailer.module';
import { StoreModule } from '../store/store.module';
import { StoreRepository } from 'src/repositories/store.repository';

@Module({
  imports: [
    UserModule,
    StoreModule,
    MailModule,
    JwtModule.register({
      secret: config.jwt?.secret,
      signOptions: {
        expiresIn: config.jwt?.expiresTime,
      },
    }),
    TypeOrmModule.forFeature([UserRepository, StoreRepository]),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
