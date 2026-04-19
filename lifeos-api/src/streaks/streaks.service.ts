import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Habit } from '../habits/entities/habit.entity';
import { HabitLog } from '../habits/entities/habit-log.entity';
import { GymActivity } from '../gym/entities/gym-activity.entity';
import { SleepLog } from '../sleep/entities/sleep-log.entity';
import { JournalEntry } from '../journal/entities/journal-entry.entity';

const DAY_MS = 86_400_000;

const ymd = (d: Date | string) => {
  if (typeof d === 'string') return d.split('T')[0];
  return d.toISOString().split('T')[0];
};

const dayDiff = (a: string, b: string) =>
  Math.round((new Date(a).getTime() - new Date(b).getTime()) / DAY_MS);

/**
 * Given a set of completion dates (YYYY-MM-DD), return:
 *  - current: consecutive days ending today (or yesterday if today absent)
 *  - longest: maximum consecutive run ever
 */
function computeStreak(dateSet: Set<string>): { current: number; longest: number } {
  if (dateSet.size === 0) return { current: 0, longest: 0 };

  const sorted = Array.from(dateSet).sort();

  // longest
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (dayDiff(sorted[i], sorted[i - 1]) === 1) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  // current: walk back from today
  const today = ymd(new Date());
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // allow "current" to include yesterday if today not yet logged
  let current = 0;
  if (!dateSet.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (dateSet.has(ymd(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { current, longest };
}

export interface HabitStreak {
  habitId: string;
  name: string;
  color: string;
  current: number;
  longest: number;
}

export interface StreakSummary {
  habits: HabitStreak[];
  gym: { current: number; longest: number };
  sleep: { current: number; longest: number; thresholdHours: number };
  journal: { current: number; longest: number };
}

@Injectable()
export class StreaksService {
  constructor(
    @InjectRepository(Habit) private readonly habitsRepo: Repository<Habit>,
    @InjectRepository(HabitLog) private readonly habitLogsRepo: Repository<HabitLog>,
    @InjectRepository(GymActivity) private readonly gymRepo: Repository<GymActivity>,
    @InjectRepository(SleepLog) private readonly sleepRepo: Repository<SleepLog>,
    @InjectRepository(JournalEntry) private readonly journalRepo: Repository<JournalEntry>,
  ) {}

  async getHabitStreaks(userId: string): Promise<HabitStreak[]> {
    const habits = await this.habitsRepo.find({
      where: { user: { id: userId }, isActive: true },
      order: { createdAt: 'ASC' },
    });
    if (!habits.length) return [];

    const logs = await this.habitLogsRepo.find({
      where: { habit: { user: { id: userId } }, completed: true },
      relations: ['habit'],
    });

    const byHabit = new Map<string, Set<string>>();
    for (const l of logs) {
      const set = byHabit.get(l.habit.id) ?? new Set();
      set.add(ymd(l.date));
      byHabit.set(l.habit.id, set);
    }

    return habits
      .map((h) => {
        const { current, longest } = computeStreak(byHabit.get(h.id) ?? new Set());
        return {
          habitId: h.id,
          name: h.name,
          color: h.color ?? '#4EDEA3',
          current,
          longest,
        };
      })
      .sort((a, b) => b.current - a.current || b.longest - a.longest);
  }

  async getGymStreak(userId: string) {
    const rows = await this.gymRepo.find({
      where: { user: { id: userId } as any },
      select: { id: true, date: true },
    });
    const set = new Set(rows.map((r) => ymd(r.date)));
    return computeStreak(set);
  }

  async getSleepStreak(userId: string, thresholdHours = 7) {
    const minMinutes = thresholdHours * 60;
    const rows = await this.sleepRepo.find({
      where: { user: { id: userId } as any },
    });
    const set = new Set(
      rows
        .filter((r) => r.durationMin >= minMinutes)
        .map((r) => ymd(r.sleepAt)),
    );
    const { current, longest } = computeStreak(set);
    return { current, longest, thresholdHours };
  }

  async getJournalStreak(userId: string) {
    const rows = await this.journalRepo.find({
      where: { user: { id: userId } },
      select: { id: true, date: true },
    });
    const set = new Set(rows.map((r) => ymd(r.date)));
    return computeStreak(set);
  }

  async getAll(userId: string): Promise<StreakSummary> {
    const [habits, gym, sleep, journal] = await Promise.all([
      this.getHabitStreaks(userId),
      this.getGymStreak(userId),
      this.getSleepStreak(userId),
      this.getJournalStreak(userId),
    ]);
    return { habits, gym, sleep, journal };
  }
}
