import { Logger, Module } from '@nestjs/common';
import { LoggingModule } from './share/logging/logging.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmOptions } from './configs/database.config';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CategoryModule } from './modules/category/category.module';

@Module({
  imports: [
    LoggingModule,
    Logger,
    HttpModule,
    TypeOrmModule.forRootAsync(typeOrmOptions),
    AuthModule,
    UserModule,
    CategoryModule,
  ],
  controllers: [],
  providers: [Logger],
})
export class AppModule {}
