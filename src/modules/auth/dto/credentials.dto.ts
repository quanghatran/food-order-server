import { ApiProperty } from '@nestjs/swagger';
import { Matches, IsString, MinLength } from 'class-validator';

export class CredentialsDto {
  @ApiProperty()
  @Matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/)
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;
}
