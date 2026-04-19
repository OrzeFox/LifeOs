import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal, GoalMetric, GoalTimeframe } from './entities/goal.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { UserContextService } from '../user-context/user-context.service';
import type { UserContext } from '../user-context/types';

export interface GoalProgress {
  goal: Goal;
  currentValue: number;
  progress: number;  // 0..1 (or >1 if exceeded for gte)
  met: boolean;
  distance: number;  // absolute gap to target
}

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal) private readonly repo: Repository<Goal>,
    private readonly context: UserContextService,
  ) {}

  create(userId: string, dto: CreateGoalDto) {
    const goal = this.repo.create({
      ...dto,
      user: { id: userId } as any,
      status: 'active',
      targetDate: dto.targetDate ?? null,
      description: dto.description ?? null,
    });
    return this.repo.save(goal);
  }

  async update(id: string, userId: string, dto: UpdateGoalDto) {
    const goal = await this.repo.findOne({ where: { id, user: { id: userId } } });
    if (!goal) throw new NotFoundException('Goal not found');
    Object.assign(goal, dto);
    if (dto.status === 'completed' && !goal.completedAt) goal.completedAt = new Date();
    return this.repo.save(goal);
  }

  async list(userId: string, status?: string) {
    return this.repo.find({
      where: { user: { id: userId }, ...(status ? { status: status as any } : {}) },
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: string, userId: string) {
    const res = await this.repo.delete({ id, user: { id: userId } });
    if (!res.affected) throw new NotFoundException('Goal not found');
    return { deleted: true };
  }

  async evaluateAll(userId: string): Promise<GoalProgress[]> {
    const goals = await this.list(userId, 'active');
    if (!goals.length) return [];
    const ctx = await this.context.build(userId);
    return goals.map((g) => this.evaluateGoal(g, ctx));
  }

  private evaluateGoal(goal: Goal, ctx: UserContext): GoalProgress {
    const currentValue = readMetric(goal.metric, goal.timeframe, ctx);
    const distance = Math.abs(goal.target - currentValue);
    let progress: number;
    let met: boolean;
    if (goal.operator === 'gte') {
      progress = goal.target > 0 ? currentValue / goal.target : currentValue > 0 ? 1 : 0;
      met = currentValue >= goal.target;
    } else {
      progress = goal.target > 0 ? Math.max(0, 1 - Math.max(0, currentValue - goal.target) / goal.target) : 1;
      met = currentValue <= goal.target;
    }
    return {
      goal,
      currentValue: Number(currentValue.toFixed(2)),
      progress: Number(progress.toFixed(3)),
      met,
      distance: Number(distance.toFixed(2)),
    };
  }
}

function readMetric(metric: GoalMetric, tf: GoalTimeframe, ctx: UserContext): number {
  switch (metric) {
    case 'sleep.avgHours':
      return tf === '30d' ? ctx.sleep.avgHours30d : ctx.sleep.avgHours7d;
    case 'gym.sessionsCount':
      return tf === '30d' ? ctx.gym.last30dCount : ctx.gym.last7dCount;
    case 'finance.monthSaved':
      return ctx.finance.monthIncome - ctx.finance.monthSpent;
    case 'habits.completionRate':
      return ctx.habits.last7dCompletionRate * 100;
    case 'journal.avgMood':
      return ctx.journal.avgMood7d;
    default:
      return 0;
  }
}
