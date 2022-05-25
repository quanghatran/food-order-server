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

export class UpdateDiscountDto {
  @ApiPropertyOptional({ enum: Status })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  end?: Date;
}
