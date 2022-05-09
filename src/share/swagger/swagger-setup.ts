import { getConfig } from '../../configs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export const swaggerConfig = {
  ...getConfig().get<any>('swagger'),
};

export function initSwagger(app: INestApplication) {
  if (!swaggerConfig.isPublic) return;

  const configSwagger = new DocumentBuilder()
    .setTitle(swaggerConfig.title)
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version)
    .setContact('VuAnh Tu', 'github.com/iamtuuuuuu', 'vuanhtu111127@gmail.com')
    .addServer(swaggerConfig.server, 'host')
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('/docs', app, document);
}
