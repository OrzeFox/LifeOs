import { IsString, IsOptional, IsEnum, IsNumber, IsArray, IsInt, IsDateString, Min, Max } from 'class-validator';
import { FrequencyType, HabitKind, HabitType } from '../entities/habit.entity';

export class CreateHabitDto {
  @IsString()
  name: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsEnum(HabitKind)
  kind?: HabitKind;

  @IsOptional() @IsEnum(HabitType)
  habitType?: HabitType;

  @IsOptional() @IsNumber()
  targetValue?: number;

  @IsOptional() @IsEnum(FrequencyType)
  frequencyType?: FrequencyType;

  @IsOptional() @IsInt() @Min(1) @Max(7)
  timesPerWeek?: number;

  @IsOptional() @IsArray()
  scheduleDays?: number[];

  @IsOptional() @IsDateString()
  startDate?: string;

  @IsOptional() @IsDateString()
  endDate?: string;

  @IsOptional() @IsString()
  notes?: string;

  @IsOptional() @IsString()
  color?: string;

  @IsOptional() @IsArray()
  checklistItems?: string[];
}
