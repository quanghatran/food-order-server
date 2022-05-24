import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({example: 'Nghĩa Đô, Cầu Giấy, Hà Nội' ,description: 'format: (xã phường, quận huyện, tỉnh thành phố)'})
  @IsString()
  @IsOptional()
  address?: string;
}
