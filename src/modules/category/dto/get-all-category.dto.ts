import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GetAllCategoryDto {
  @ApiPropertyOptional({ nullable: true })
  filter: string;

  @ApiPropertyOptional({ nullable: true })
  page: number;

  @ApiPropertyOptional({ nullable: true })
  perPage: number;
}
