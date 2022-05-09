import { getConfig } from 'src/configs/index';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { LoggingService } from '../share/logging';

export interface DatabaseConfig {
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  entities: string[];
  logging: boolean | string[] | string;
  extra: {
    connectionLimit: 100;
  };
}

export const defaultConfig = {
  ...getConfig().get<DatabaseConfig>('default'),
  autoLoadEntities: true,
};
console.log(
  '🚀 ~ file: database.config.ts ~ line 23 ~ defaultConfig',
  defaultConfig,
);

export const typeOrmOptions: TypeOrmModuleAsyncOptions = {
  useFactory: () => {
    return {
      ...defaultConfig,
      synchronize: true,
      logger: 'debug',
    } as TypeOrmModuleOptions;
  },
};
