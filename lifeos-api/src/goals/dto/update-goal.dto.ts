import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateGoalDto } from './create-goal.dto';
import type { GoalStatus } from '../entities/goal.entity';

export class UpdateGoalDto extends PartialType(CreateGoalDto) {
  @IsOptional()
  @IsEnum(['active', 'completed', 'failed', 'paused', 'archived'])
  status?: GoalStatus;
}
