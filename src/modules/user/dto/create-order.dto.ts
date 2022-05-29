import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEnum,
  IsNumber, IsOptional,
  IsString,
  Min,
  ValidateNested
} from "class-validator";
import { Type } from 'class-transformer';
import { PaymentType } from '../../../entities';

export class Item {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [Item] })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => Item)
  items: Item[];

  @ApiProperty({ enum: PaymentType })
  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @ApiProperty()
  @IsDate()
  timeReceive: Date;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  discountId?: string;
}
