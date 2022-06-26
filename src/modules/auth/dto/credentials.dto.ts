import { ApiProperty } from '@nestjs/swagger';
import { Matches, IsString, MinLength } from 'class-validator';

export class CredentialsDto {
  @ApiProperty({ example: '0363791428' })
  @Matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/)
  phoneNumber: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class PasswordDto {
  @ApiProperty({ example: '12345678' })
  @IsString()
  @MinLength(6)
  password: string;
}
