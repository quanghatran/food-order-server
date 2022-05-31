import { IsEnum, IsOptional, IsString, Matches } from "class-validator";
import { Status } from '../../../entities';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStoreDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @Matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/)
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  timeOpen?: string;

  @IsString()
  @IsOptional()
  timeClose?: string;
}

export class UpdateStatusDto {
  @ApiProperty({ enum: Status })
  @IsEnum(Status)
  status: Status;
}
