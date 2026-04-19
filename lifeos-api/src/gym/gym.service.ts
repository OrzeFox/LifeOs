import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GymActivity, ActivityType } from './entities/gym-activity.entity';

@Injectable()
export class GymService {
  constructor(
    @InjectRepository(GymActivity)
    private readonly activitiesRepo: Repository<GymActivity>,
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
}
