import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentType } from '../../../entities';

export class Item {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => Item)
  items: Item[];

  @ApiProperty({ enum: PaymentType })
  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @ApiPropertyOptional()
  @IsString()
  discountId?: string;
}
