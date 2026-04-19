import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSleepLogDto {
  @IsDateString()
  sleepAt: string;

  @IsDateString()
  wakeAt: string;

  @IsOptional() @IsString() @MaxLength(500)
  notes?: string;
}
