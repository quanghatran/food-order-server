import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { DiscountType, Status } from '../../../entities';

export class CreateDiscountDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: DiscountType })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  discountPercent?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  discountPrice?: number;

  @ApiPropertyOptional({ enum: Status })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  start?: Date;

  @ApiProperty()
  @IsDate()
  end: Date;
}
