import { Logger, Module } from '@nestjs/common';
import { LoggingModule } from './share/logging/logging.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmOptions } from './configs/database.config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    LoggingModule,
    Logger,
    HttpModule,
    TypeOrmModule.forRootAsync(typeOrmOptions),
  ],
  controllers: [],
  providers: [Logger],
})
export class AppModule {}
