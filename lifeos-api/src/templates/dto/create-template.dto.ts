import { IsArray, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { TemplateHabitSpec } from '../entities/routine-template.entity';

export class TemplateHabitDto implements TemplateHabitSpec {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string | null;
  @IsString() habitType: 'simple' | 'timer' | 'numeric' | 'checklist';
  @IsOptional() targetValue?: number | null;
  @IsString() frequencyType: 'daily' | 'weekly' | 'custom';
  @IsOptional() timesPerWeek?: number | null;
  @IsOptional() scheduleDays?: number[] | null;
  @IsOptional() @IsString() color?: string | null;
  @IsOptional() checklistItems?: string[] | null;
}

export class CreateTemplateDto {
  @IsString() @Length(1, 120)
  name: string;

  @IsOptional() @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateHabitDto)
  habits: TemplateHabitDto[];
}
