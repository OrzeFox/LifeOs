import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Habit } from './habit.entity';
import { HabitLog } from './habit-log.entity';

@Injectable()
export class HabitsService {
  constructor(
    @InjectRepository(Habit)
    private readonly habitsRepo: Repository<Habit>,
    @InjectRepository(HabitLog)
    private readonly logsRepo: Repository<HabitLog>,
  ) {}

  createHabit(userId: string, data: Partial<Habit>) {
    const habit = this.habitsRepo.create({ ...data, user: { id: userId } });
    return this.habitsRepo.save(habit);
  }

  getHabits(userId: string) {
    return this.habitsRepo.find({
      where: { user: { id: userId }, isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  deleteHabit(id: string, userId: string) {
    return this.habitsRepo.update({ id, user: { id: userId } }, { isActive: false });
  }

  // Toggle completed para una fecha
  async toggleLog(habitId: string, date: string) {
    let log = await this.logsRepo.findOne({ where: { habit: { id: habitId }, date } });
    if (!log) {
      log = this.logsRepo.create({ habit: { id: habitId }, date, completed: true });
    } else {
      log.completed = !log.completed;
    }
    return this.logsRepo.save(log);
  }

  // Hábitos del día con su estado
  async getHabitsForDate(userId: string, date: string) {
    const habits = await this.habitsRepo.find({
      where: { user: { id: userId }, isActive: true },
    });
    const logs = await this.logsRepo.find({
      where: { habit: { user: { id: userId } }, date },
      relations: ['habit'],
    });
    const logMap = new Map(logs.map(l => [l.habit.id, l.completed]));

    return habits.map(h => ({
      id: h.id,
      name: h.name,
      description: h.description,
      completed: logMap.get(h.id) ?? false,
    }));
  }

  // Streak: días consecutivos completados hasta hoy
  async getStreak(habitId: string): Promise<number> {
    const logs = await this.logsRepo.find({
      where: { habit: { id: habitId }, completed: true },
      order: { date: 'DESC' },
    });
    if (!logs.length) return 0;

    let streak = 0;
    let current = new Date();
    current.setHours(0, 0, 0, 0);

    for (const log of logs) {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      const diff = Math.round((current.getTime() - logDate.getTime()) / 86400000);
      if (diff === 0 || diff === 1) {
        streak++;
        current = logDate;
      } else {
        break;
      }
    }
    return streak;
  }
}
