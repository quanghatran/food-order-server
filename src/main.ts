import * as dotenv from 'dotenv';
dotenv.config();
import * as config from 'config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingService } from './share/logging';
import {
  HttpExceptionFilter,
  UnknownExceptionsFilter,
  useMorgan,
} from './share/middlewares';
import { ResponseTransformInterceptor } from './share/inteceptors/response.interceptor';
import { BodyValidationPipe } from './share/pipes/body.validatation.pipe';
import { RedisIoAdapter } from './adapters/redis.adapter';
import { initSwagger } from './share/swagger/swagger-setup';

const appPort = config.get<number>('app.port');
const prefix = config.get<string>('app.prefix');

console.log(config);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  app.enableCors();

  const loggingService = app.get(LoggingService);
  const logger = loggingService.getLogger('Appication');
  app.use(useMorgan(loggingService.logger.access));

  app.setGlobalPrefix(prefix);
  // app.useGlobalInterceptors(new ResponseTransformInterceptor());
  // app.useGlobalFilters(new HttpExceptionFilter());
  // app.useGlobalFilters(new UnknownExceptionsFilter());
  app.useGlobalPipes(new BodyValidationPipe());

  // const redisIoAdapter = new RedisIoAdapter(app);
  // await redisIoAdapter.connectToRedis();
  // app.useWebSocketAdapter(redisIoAdapter);

  initSwagger(app);

  await app.listen(appPort);
  logger.info(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
