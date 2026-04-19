import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpsertJournalDto {
  @IsInt() @Min(1) @Max(10)
  mood: number;

  @IsInt() @Min(1) @Max(10)
  energyLevel: number;

  @IsOptional() @IsString()
  notes?: string;
}
