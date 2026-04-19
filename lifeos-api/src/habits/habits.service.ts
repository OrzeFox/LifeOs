import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { FrequencyType, Habit, HabitKind, HabitType } from './entities/habit.entity';
import { HabitLog } from './entities/habit-log.entity';

function computeProgress(habit: Habit, value: number, checklistState?: boolean[]): number {
  switch (habit.habitType) {
    case HabitType.SIMPLE:
      return value >= 1 ? 100 : value > 0 ? 50 : 0;
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
    case HabitType.SIMPLE: return value >= 1;
    case HabitType.TIMER:
    case HabitType.NUMERIC: return value >= (habit.targetValue ?? 1);
    case HabitType.CHECKLIST: {
      const items = habit.checklistItems ?? [];
      return items.length > 0 && (checklistState ?? []).every(Boolean);
    }
    default: return false;
  }
}

function weekRange(dateStr: string): { start: string; end: string } {
  const d = new Date(dateStr + 'T12:00:00');
  const dow = d.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const start = new Date(d); start.setDate(d.getDate() + mondayOffset);
  const end = new Date(start); end.setDate(start.getDate() + 6);
  return {
    start: start.toISOString().split('T')[0],
    end:   end.toISOString().split('T')[0],
  };
}

function isWithinRange(habit: Habit, dateStr: string): boolean {
  if (habit.startDate && dateStr < habit.startDate) return false;
  if (habit.endDate && dateStr > habit.endDate) return false;
  return true;
}

@Injectable()
export class HabitsService {
  constructor(
    @InjectRepository(Habit)
    private readonly habitsRepo: Repository<Habit>,
    @InjectRepository(HabitLog)
    private readonly logsRepo: Repository<HabitLog>,
  ) { }

  // ── Scheduling: is this habit due on the given date? ──
  private async isScheduledForDate(habit: Habit, dateStr: string): Promise<boolean> {
    if (!isWithinRange(habit, dateStr)) return false;

    // Task: only on startDate (or createdAt if no startDate) and only until completed
    if (habit.kind === HabitKind.TASK) {
      const due = habit.startDate ?? String(habit.createdAt).split('T')[0];
      if (dateStr < due) return false;
      const log = await this.logsRepo.findOne({ where: { habit: { id: habit.id }, completed: true } });
      if (log) return String(log.date).split('T')[0] === dateStr;
      return true;
    }

    const freq = habit.frequencyType ?? FrequencyType.DAILY;
    if (freq === FrequencyType.DAILY) return true;

    if (freq === FrequencyType.CUSTOM) {
      const days = habit.scheduleDays ?? [];
      if (!days.length) return true;
      return days.includes(new Date(dateStr + 'T12:00:00').getDay());
    }

    if (freq === FrequencyType.WEEKLY) {
      // Due until N completions happen in the week
      const target = habit.timesPerWeek ?? 1;
      const { start, end } = weekRange(dateStr);
      const done = await this.logsRepo.count({
        where: { habit: { id: habit.id }, completed: true, date: Between(start, end) },
      });
      // If this date already has a completion, it's still "scheduled" so UI can reflect it.
      const todayLog = await this.logsRepo.findOne({ where: { habit: { id: habit.id }, date: dateStr } });
      if (todayLog?.completed) return true;
      return done < target;
    }

    return true;
  }

  private scheduleLabel(habit: Habit): string {
    const freq = habit.frequencyType ?? FrequencyType.DAILY;
    if (habit.kind === HabitKind.TASK) return 'Tarea';
    if (freq === FrequencyType.DAILY) return 'Diario';
    if (freq === FrequencyType.WEEKLY) return `${habit.timesPerWeek ?? 1}×/sem`;
    if (freq === FrequencyType.CUSTOM) {
      const ds = habit.scheduleDays ?? [];
      if (!ds.length) return 'Diario';
      const names = ['D','L','M','X','J','V','S'];
      return ds.sort((a, b) => a - b).map((d) => names[d]).join(' ');
    }
    return 'Diario';
  }

  // ── CRUD ──
  createHabit(userId: string, data: Partial<Habit>) {
    const habit = this.habitsRepo.create({ ...data, user: { id: userId } });
    return this.habitsRepo.save(habit);
  }

  async updateHabit(id: string, userId: string, data: Partial<Habit>) {
    await this.habitsRepo.update({ id, user: { id: userId } }, data);
    return this.habitsRepo.findOne({ where: { id, user: { id: userId } } });
  }

  getHabits(userId: string, opts: { includeInactive?: boolean } = {}) {
    return this.habitsRepo.find({
      where: { user: { id: userId }, ...(opts.includeInactive ? {} : { isActive: true }) },
      order: { createdAt: 'ASC' },
    });
  }

  deleteHabit(id: string, userId: string) {
    return this.habitsRepo.delete({ id, user: { id: userId } });
  }

  setActive(id: string, userId: string, isActive: boolean) {
    return this.habitsRepo.update({ id, user: { id: userId } }, { isActive });
  }

  // ── Legacy toggle (used by dashboard) ──
  async toggleLog(habitId: string, date: string) {
    const habit = await this.habitsRepo.findOne({ where: { id: habitId } });
    let log = await this.logsRepo.findOne({ where: { habit: { id: habitId }, date } });
    const newValue = log?.completed ? 0 : 1;
    if (!habit) return null;
    const completed = isCompleted(habit, newValue);
    if (!log) {
      log = this.logsRepo.create({ habit: { id: habitId }, date, value: newValue, completed });
    } else {
      log.value = newValue;
      log.completed = completed;
    }
    return this.logsRepo.save(log);
  }

  // ── Increment numeric progress by 1 (or custom step) ──
  async incrementProgress(habitId: string, date: string, step = 1) {
    const habit = await this.habitsRepo.findOne({ where: { id: habitId } });
    if (!habit) return null;
    const log = await this.logsRepo.findOne({ where: { habit: { id: habitId }, date } });
    const current = log?.value ?? 0;
    const next = current + step;
    return this.setProgress(habitId, date, next);
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

    const logs = await this.logsRepo.find({
      where: { habit: { user: { id: userId } }, date },
      relations: ['habit'],
    });
    const logMap = new Map(logs.map((l) => [l.habit.id, l]));

    const result: any[] = [];
    for (const h of habits) {
      const scheduled = await this.isScheduledForDate(h, date);
      if (!scheduled) continue;

      const log = logMap.get(h.id);
      const value = log?.value ?? 0;
      const checklistState = log?.checklistState ?? null;
      const habitType = h.habitType ?? HabitType.SIMPLE;
      result.push({
        id: h.id,
        name: h.name,
        description: h.description,
        kind: h.kind ?? HabitKind.HABIT,
        habitType,
        targetValue: h.targetValue,
        frequencyType: h.frequencyType ?? FrequencyType.DAILY,
        timesPerWeek: h.timesPerWeek,
        scheduleDays: h.scheduleDays,
        startDate: h.startDate,
        endDate: h.endDate,
        notes: h.notes,
        color: h.color ?? '#4EDEA3',
        checklistItems: h.checklistItems ?? [],
        frequencyLabel: this.scheduleLabel(h),
        completed: log?.completed ?? false,
        value,
        progress: computeProgress({ ...h, habitType: habitType as HabitType }, value, checklistState ?? undefined),
        checklistState,
      });
    }
    return result;
  }

  // ── Calendar: logs for a habit in a month ──
  async getHabitCalendar(habitId: string, year: number, month: number) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = new Date(year, month, 0).toISOString().split('T')[0];
    const habit = await this.habitsRepo.findOne({ where: { id: habitId } });
    const logs = await this.logsRepo.find({
      where: { habit: { id: habitId }, date: Between(start, end) },
    });

    const logMap = new Map(logs.map((l) => [String(l.date).split('T')[0], l]));
    const daysInMonth = new Date(year, month, 0).getDate();
    const result: { date: string; scheduled: boolean; completed: boolean; progress: number; value: number }[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const log = logMap.get(dateStr);
      const value = log?.value ?? 0;
      if (!habit) return null;
      result.push({
        date: dateStr,
        scheduled: await this.isScheduledForDate(habit, dateStr),
        completed: log?.completed ?? false,
        progress: log ? computeProgress(habit, value, log.checklistState ?? undefined) : 0,
        value,
      });
    }
    return result;
  }

  // ── Global monthly calendar: all habits rolled up per day ──
  async getMonthlyRollup(userId: string, year: number, month: number) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = new Date(year, month, 0).toISOString().split('T')[0];
    const habits = await this.habitsRepo.find({
      where: { user: { id: userId }, isActive: true },
    });
    const logs = await this.logsRepo.find({
      where: { habit: { user: { id: userId } }, date: Between(start, end) },
      relations: ['habit'],
    });

    const logsByDate = new Map<string, typeof logs>();
    for (const l of logs) {
      const key = String(l.date).split('T')[0];
      const arr = logsByDate.get(key) ?? [];
      arr.push(l);
      logsByDate.set(key, arr);
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const result: { date: string; scheduled: number; completed: number; colors: string[] }[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      let scheduled = 0;
      const completedColors: string[] = [];

      for (const h of habits) {
        if (await this.isScheduledForDate(h, dateStr)) {
          scheduled += 1;
        }
      }
      for (const l of (logsByDate.get(dateStr) ?? [])) {
        if (l.completed) completedColors.push(l.habit.color ?? '#4EDEA3');
      }

      result.push({
        date: dateStr,
        scheduled,
        completed: completedColors.length,
        colors: completedColors,
      });
    }
    return result;
  }

  // ── History: last N days for comparison ──
  async getHabitHistory(habitId: string, days = 14) {
    const habit = await this.habitsRepo.findOne({ where: { id: habitId } });
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days + 1);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

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
      if (!habit) return null;
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
