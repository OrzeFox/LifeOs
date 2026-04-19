import { IsEnum, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import type {
  GoalMetric, GoalOperator, GoalTimeframe,
} from '../entities/goal.entity';

const METRICS: GoalMetric[] = [
  'sleep.avgHours',
  'gym.sessionsCount',
  'finance.monthSaved',
  'habits.completionRate',
  'journal.avgMood',
];

export class CreateGoalDto {
  @IsString() @Length(1, 120)
  title: string;

  @IsOptional() @IsString()
  description?: string;

  @IsEnum(METRICS)
  metric: GoalMetric;

  @IsEnum(['gte', 'lte'])
  operator: GoalOperator;

  @IsNumber()
  target: number;

  @IsEnum(['7d', '30d', 'month'])
  timeframe: GoalTimeframe;

  @IsOptional() @IsString()
  targetDate?: string;
}
