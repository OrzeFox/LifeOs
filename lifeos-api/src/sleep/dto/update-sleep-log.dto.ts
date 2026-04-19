import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSleepLogDto {
  @IsOptional() @IsDateString()
  sleepAt?: string;

  @IsOptional() @IsDateString()
  wakeAt?: string;

  @IsOptional() @IsString() @MaxLength(500)
  notes?: string;
}
