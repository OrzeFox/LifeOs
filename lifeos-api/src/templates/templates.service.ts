import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoutineTemplate } from './entities/routine-template.entity';
import { CreateTemplateDto } from './dto/create-template.dto';
import { Habit, FrequencyType, HabitType } from '../habits/entities/habit.entity';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(RoutineTemplate)
    private readonly repo: Repository<RoutineTemplate>,
    @InjectRepository(Habit)
    private readonly habitsRepo: Repository<Habit>,
  ) {}

  list(userId: string) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async create(userId: string, dto: CreateTemplateDto) {
    const t = this.repo.create({
      user: { id: userId } as any,
      name: dto.name,
      description: dto.description ?? null,
      habits: dto.habits,
    });
    return this.repo.save(t);
  }

  async delete(id: string, userId: string) {
    const res = await this.repo.delete({ id, user: { id: userId } });
    if (!res.affected) throw new NotFoundException('Template not found');
    return { deleted: true };
  }

  async apply(id: string, userId: string): Promise<{ created: number; skipped: number }> {
    const t = await this.repo.findOne({ where: { id, user: { id: userId } } });
    if (!t) throw new NotFoundException('Template not found');

    const existing = await this.habitsRepo.find({
      where: { user: { id: userId }, isActive: true },
      select: { name: true },
    });
    const existingNames = new Set(existing.map((h) => h.name.toLowerCase()));

    const toCreate = t.habits.filter((h) => !existingNames.has(h.name.toLowerCase()));
    const skipped = t.habits.length - toCreate.length;

    const entities = toCreate.map((h) =>
      this.habitsRepo.create({
        user: { id: userId } as any,
        name: h.name,
        description: h.description ?? undefined,
        habitType: (h.habitType ?? 'simple') as HabitType,
        targetValue: h.targetValue ?? undefined,
        frequencyType: (h.frequencyType ?? 'daily') as FrequencyType,
        timesPerWeek: h.timesPerWeek ?? undefined,
        scheduleDays: h.scheduleDays ?? undefined,
        color: h.color ?? '#4EDEA3',
        checklistItems: h.checklistItems ?? undefined,
        isActive: true,
      }),
    );
    if (entities.length) await this.habitsRepo.save(entities);

    t.lastAppliedAt = new Date();
    await this.repo.save(t);
    return { created: entities.length, skipped };
  }

  async saveFromExisting(userId: string, name: string, description: string | null): Promise<RoutineTemplate> {
    const active = await this.habitsRepo.find({
      where: { user: { id: userId }, isActive: true },
    });
    const habits = active.map((h) => ({
      name: h.name,
      description: h.description ?? null,
      habitType: h.habitType,
      targetValue: h.targetValue ?? null,
      frequencyType: h.frequencyType,
      timesPerWeek: h.timesPerWeek ?? null,
      scheduleDays: h.scheduleDays ?? null,
      color: h.color ?? null,
      checklistItems: h.checklistItems ?? null,
    }));
    const t = this.repo.create({
      user: { id: userId } as any,
      name,
      description,
      habits,
    });
    return this.repo.save(t);
  }
}
