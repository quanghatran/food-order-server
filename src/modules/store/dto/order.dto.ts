import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, Min, MIN } from 'class-validator';
import { OrderStatus } from '../../../entities';

export class UpdateOrder {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class PaginationDto {
  @ApiProperty({ nullable: true })
  @Min(0)
  page: number;

  @ApiProperty({ nullable: true })
  perPage: number;
}
