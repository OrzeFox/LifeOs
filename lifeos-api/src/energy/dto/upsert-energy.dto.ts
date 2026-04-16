import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertEnergyDto {
  @IsString() date: string;
  @IsInt() @Min(1) @Max(10) @Type(() => Number) level: number;
  @IsOptional() @IsString() notes?: string;
}
