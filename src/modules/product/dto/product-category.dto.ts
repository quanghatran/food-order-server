import { ApiProperty } from '@nestjs/swagger';

export class ProductCaregoryDto {
  @ApiProperty({ nullable: true })
  page: number;

  @ApiProperty({ nullable: true })
  perPage: number;
}
