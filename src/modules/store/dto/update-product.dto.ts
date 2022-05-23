import { IsEmpty, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Status } from "../../../entities";

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsEnum(Status)
  @IsOptional()
  status?: Status
}
