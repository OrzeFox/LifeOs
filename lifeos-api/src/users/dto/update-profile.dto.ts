import { IsOptional, IsString, IsDateString, IsNumber, Min, Max, IsIn } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsDateString()
  birthdate?: string;

  @IsOptional() @IsNumber() @Min(50) @Max(250)
  heightCm?: number;

  @IsOptional() @IsNumber() @Min(20) @Max(500)
  weightKg?: number;

  @IsOptional() @IsIn(['gain', 'lose', 'maintain'])
  goal?: 'gain' | 'lose' | 'maintain';
}
