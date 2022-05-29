import { ApiProperty } from '@nestjs/swagger';

export class ProductStoreDto {
  @ApiProperty({ nullable: true })
  page: number;

  @ApiProperty({ nullable: true })
  perPage: number;
}
