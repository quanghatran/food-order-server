import { ApiProperty } from '@nestjs/swagger';

export class GetAllUserDto {
  @ApiProperty({ nullable: true })
  filter: string;

  @ApiProperty({ nullable: true })
  page: number;

  @ApiProperty({ nullable: true })
  perPage: number;
}
