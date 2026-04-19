import { IsEnum, IsInt, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityType } from '../entities/gym-activity.entity';

export class CreateActivityDto {
  @IsEnum(ActivityType) activityType: ActivityType;
  @IsInt() @Min(1) @Type(() => Number) duration: number;
  @IsOptional() @IsNumber() @Type(() => Number) weight?: number;
  @IsOptional() @IsString() notes?: string;
  @IsDateString() date: string;
}
