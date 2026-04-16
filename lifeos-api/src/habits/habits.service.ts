import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Habit, HabitType } from './entities/habit.entity';
import { HabitLog } from './entities/habit-log.entity';

function computeProgress(habit: Habit, value: number, checklistState?: boolean[]): number {
  switch (habit.habitType) {
    case HabitType.SIMPLE:
      return value >= 1 ? 100 : 0;
    case HabitType.TIMER:
    case HabitType.NUMERIC:
      return habit.targetValue > 0
        ? Math.min(Math.round((value / habit.targetValue) * 100), 100)
        : 0;
    case HabitType.CHECKLIST: {
      const items = habit.checklistItems ?? [];
      if (!items.length) return 0;
      const done = (checklistState ?? []).filter(Boolean).length;
      return Math.round((done / items.length) * 100);
    }
    default: return 0;
  }
}

function isCompleted(habit: Habit, value: number, checklistState?: boolean[]): boolean {
  switch (habit.habitType) {
    case HabitType.SIMPLE:    return value >= 1;
    case HabitType.TIMER:
    case HabitType.NUMERIC:   return value >= (habit.targetValue ?? 1);
    case HabitType.CHECKLIST: {
      const items = habit.checklistItems ?? [];
      return items.length > 0 && (checklistState ?? []).every(Boolean);
    }
    default: return false;
  }
}

function isScheduledForDate(habit: Habit, dateStr: string): boolean {
  const days = habit.scheduleDays;
  if (!days || days.length === 0) return true;
  const dow = new Date(dateStr + 'T12:00:00').getDay();
  return days.includes(dow);
}

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

  // ── Legacy toggle (used by dashboard) ──
  async toggleLog(habitId: string, date: string) {
    const habit = await this.habitsRepo.findOne({ where: { id: habitId } });
    let log = await this.logsRepo.findOne({ where: { habit: { id: habitId }, date } });
    const newValue = log?.completed ? 0 : 1;
    const completed = isCompleted(habit, newValue);
    if (!log) {
      log = this.logsRepo.create({ habit: { id: habitId }, date, value: newValue, completed });
    } else {
      log.value = newValue;
      log.completed = completed;
    }
    return this.logsRepo.save(log);
  }

  // ── Set progress (main habits page) ──
  async setProgress(habitId: string, date: string, value: number, checklistState?: boolean[]) {
    const habit = await this.habitsRepo.findOne({ where: { id: habitId } });
    if (!habit) return null;

    const completed = isCompleted(habit, value, checklistState);
    let log = await this.logsRepo.findOne({ where: { habit: { id: habitId }, date } });

    if (!log) {
      log = this.logsRepo.create({ habit: { id: habitId }, date, value, completed, checklistState });
    } else {
      log.value = value;
      log.completed = completed;
      log.checklistState = checklistState ?? log.checklistState;
    }
    return this.logsRepo.save(log);
  }

  // ── Habits for a date (with completion state) ──
  async getHabitsForDate(userId: string, date: string) {
    const habits = await this.habitsRepo.find({
      where: { user: { id: userId }, isActive: true },
      order: { createdAt: 'ASC' },
    });
    const scheduled = habits.filter((h) => isScheduledForDate(h, date));

    const logs = await this.logsRepo.find({
      where: { habit: { user: { id: userId } }, date },
      relations: ['habit'],
    });
    const logMap = new Map(logs.map((l) => [l.habit.id, l]));

    return scheduled.map((h) => {
      const log = logMap.get(h.id);
      const value = log?.value ?? 0;
      const checklistState = log?.checklistState ?? null;
      const habitType = h.habitType ?? HabitType.SIMPLE;
      return {
        id: h.id,
        name: h.name,
        description: h.description,
        habitType,
        targetValue: h.targetValue,
        scheduleDays: h.scheduleDays,
        color: h.color ?? '#4EDEA3',
        checklistItems: h.checklistItems ?? [],
        completed: log?.completed ?? false,
        value,
        progress: computeProgress({ ...h, habitType: habitType as HabitType }, value, checklistState ?? undefined),
        checklistState,
      };
    });
  }

  // ── Calendar: logs for a habit in a month ──
  async getHabitCalendar(habitId: string, year: number, month: number) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end   = new Date(year, month, 0).toISOString().split('T')[0];
    const habit = await this.habitsRepo.findOne({ where: { id: habitId } });
    const logs  = await this.logsRepo.find({
      where: { habit: { id: habitId }, date: Between(start, end) },
    });

    const logMap = new Map(logs.map((l) => [String(l.date).split('T')[0], l]));
    const daysInMonth = new Date(year, month, 0).getDate();
    const result: { date: string; scheduled: boolean; completed: boolean; progress: number; value: number }[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const log = logMap.get(dateStr);
      const value = log?.value ?? 0;
      result.push({
        date: dateStr,
        scheduled: isScheduledForDate(habit, dateStr),
        completed: log?.completed ?? false,
        progress: log ? computeProgress(habit, value, log.checklistState ?? undefined) : 0,
        value,
      });
    }
    return result;
  }

  // ── History: last N days for comparison ──
  async getHabitHistory(habitId: string, days = 14) {
    const habit = await this.habitsRepo.findOne({ where: { id: habitId } });
    const end   = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days + 1);

    const startStr = start.toISOString().split('T')[0];
    const endStr   = end.toISOString().split('T')[0];

    const logs = await this.logsRepo.find({
      where: { habit: { id: habitId }, date: Between(startStr, endStr) },
      order: { date: 'ASC' },
    });
    const logMap = new Map(logs.map((l) => [String(l.date).split('T')[0], l]));

    const result: { date: string; completed: boolean; progress: number; value: number }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const log = logMap.get(dateStr);
      const value = log?.value ?? 0;
      result.push({
        date: dateStr,
        completed: log?.completed ?? false,
        progress: log ? computeProgress(habit, value, log.checklistState ?? undefined) : 0,
        value,
      });
    }
    return result;
  }

  // ── Streak ──
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
      if (diff === 0 || diff === 1) { streak++; current = logDate; }
      else break;
    }
    return streak;
  }
}
