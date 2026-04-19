import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GymActivity, ActivityType } from './entities/gym-activity.entity';
import { Recommendation } from './entities/recommendation.entity';
import { UsersService } from '../users/users.service';
import { AI_SERVICE } from '../ai/ai.service';
import type { AiService } from '../ai/ai.service';

@Injectable()
export class GymService {
  constructor(
    @InjectRepository(GymActivity)
    private readonly activitiesRepo: Repository<GymActivity>,
    @InjectRepository(Recommendation)
    private readonly recommendationsRepo: Repository<Recommendation>,
    private readonly usersService: UsersService,
    @Inject(AI_SERVICE) private readonly ai: AiService,
  ) {}

  create(userId: string, data: Partial<GymActivity>) {
    const activity = this.activitiesRepo.create({ ...data, user: { id: userId } });
    return this.activitiesRepo.save(activity);
  }

  getAll(userId: string, type?: ActivityType) {
    return this.activitiesRepo.find({
      where: {
        user: { id: userId },
        ...(type ? { activityType: type } : {}),
      },
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  delete(id: string, userId: string) {
    return this.activitiesRepo.delete({ id, user: { id: userId } });
  }

  async getSummary(userId: string) {
    const items = await this.activitiesRepo.find({ where: { user: { id: userId } } });
    const byType: Record<string, { count: number; duration: number }> = {};
    let totalMinutes = 0;
    for (const a of items) {
      const key = a.activityType;
      if (!byType[key]) byType[key] = { count: 0, duration: 0 };
      byType[key].count += 1;
      byType[key].duration += a.duration;
      totalMinutes += a.duration;
    }
    return { total: items.length, totalMinutes, byType };
  }

  getLatestRecommendation(userId: string) {
    return this.recommendationsRepo.findOne({
      where: { user: { id: userId } as any },
      order: { generatedAt: 'DESC' },
    });
  }

  private computeAge(birthdate?: Date): number | undefined {
    if (!birthdate) return undefined;
    const diff = Date.now() - new Date(birthdate).getTime();
    return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
  }

  async generateRecommendation(userId: string, notes?: string) {
    const profile = await this.usersService.getProfile(userId);
    if (!profile.goal) {
      throw new BadRequestException('Debes definir un objetivo en tu perfil antes de generar recomendaciones');
    }

    const plan = await this.ai.generateFitnessPlan({
      goal: profile.goal,
      heightCm: profile.heightCm ?? undefined,
      weightKg: profile.weightKg ?? undefined,
      age: this.computeAge(profile.birthdate ?? undefined),
      notes,
    });

    const rec = this.recommendationsRepo.create({
      user: { id: userId } as any,
      goal: profile.goal,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      aiProvider: 'groq',
      summary: plan.summary,
      workoutPlan: plan.workoutPlan,
      mealPlan: plan.mealPlan,
    });
    return this.recommendationsRepo.save(rec);
  }
}
