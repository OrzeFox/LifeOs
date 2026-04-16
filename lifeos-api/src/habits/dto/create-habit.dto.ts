import { IsString, IsOptional, IsEnum, IsNumber, IsArray, IsHexColor } from 'class-validator';
import { HabitType } from '../entities/habit.entity';

export class CreateHabitDto {
  @IsString()
  name: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsEnum(HabitType)
  habitType?: HabitType;

  @IsOptional() @IsNumber()
  targetValue?: number;

  @IsOptional() @IsArray()
  scheduleDays?: number[];

  @IsOptional() @IsString()
  color?: string;

  @IsOptional() @IsArray()
  checklistItems?: string[];
}
