import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from 'class-validator';

export class GetAllProductDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  filter?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  perPage?: number;
}
