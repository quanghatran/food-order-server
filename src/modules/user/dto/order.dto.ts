import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Max, Min } from 'class-validator';

export class RatingOrderDto {
  @ApiProperty()
  @Min(1)
  @Max(5)
  @IsNumber()
  star: number;

  @ApiProperty()
  @IsString()
  content: string;
}
