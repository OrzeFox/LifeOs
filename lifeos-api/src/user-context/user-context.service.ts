import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThanOrEqual, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { SleepService } from '../sleep/sleep.service';
import { GymService } from '../gym/gym.service';
import { NutritionService } from '../nutrition/nutrition.service';
import { HabitsService } from '../habits/habits.service';
import { FinancesService } from '../finances/finances.service';
import { EventsService } from '../events/events.service';
import { JournalService } from '../journal/journal.service';
import { StreaksService } from '../streaks/streaks.service';
import { SleepLog } from '../sleep/entities/sleep-log.entity';
import { GymActivity } from '../gym/entities/gym-activity.entity';
import type { UserContext, DateRange } from './types';

const DAY_MS = 86_400_000;

function ymd(d: Date): string {
  return d.toISOString().split('T')[0];
}

function rangeDays(days: number): DateRange {
  const to = new Date();
  const from = new Date(to.getTime() - (days - 1) * DAY_MS);
  return { from: ymd(from), to: ymd(to) };
}

function computeAge(birthdate?: Date | null): number | null {
  if (!birthdate) return null;
  const diff = Date.now() - new Date(birthdate).getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

@Injectable()
export class UserContextService {
  private readonly logger = new Logger(UserContextService.name);

  constructor(
    private readonly users: UsersService,
    private readonly sleep: SleepService,
    private readonly gym: GymService,
    private readonly nutrition: NutritionService,
    private readonly habits: HabitsService,
    private readonly finances: FinancesService,
    private readonly events: EventsService,
    private readonly journal: JournalService,
    private readonly streaks: StreaksService,
    @InjectRepository(SleepLog) private readonly sleepRepo: Repository<SleepLog>,
    @InjectRepository(GymActivity) private readonly gymRepo: Repository<GymActivity>,
  ) {}

  async build(userId: string, opts: { days?: number } = {}): Promise<UserContext> {
    const days = opts.days ?? 7;
    const range = rangeDays(days);
    const today = ymd(new Date());

    const [profileRaw, sleepStats, gymActivities, nutToday, nutRange, habitsToday, eventsToday, eventsNext7, financeMonth, weekSpent, journalToday, journalStats] =
      await Promise.all([
        this.users.getProfile(userId),
        this.sleep.stats(userId),
        this.gym.getAll(userId),
        this.nutrition.getDailySummary(userId, today),
        this.nutrition.getRangeSummary(userId, range.from, range.to),
        this.habits.getHabitsForDate(userId, today),
        this.eventsToday(userId),
        this.eventsUpcoming(userId, 7),
        this.financeMonth(userId),
        this.weekSpent(userId),
        this.journal.getForDate(userId, today),
        this.journal.stats(userId),
      ]);

    const topHabitStreaks = (await this.streaks.getHabitStreaks(userId)).slice(0, 5);

    // SLEEP: low-sleep streak (consecutive recent days < 6h)
    const recentSleep = await this.sleepRepo.find({
      where: { user: { id: userId } as any, sleepAt: MoreThanOrEqual(new Date(Date.now() - 14 * DAY_MS)) },
      order: { sleepAt: 'DESC' },
    });
    let lowSleepStreak = 0;
    for (const log of recentSleep) {
      if (log.durationMin / 60 < 6) lowSleepStreak++;
      else break;
    }

    // GYM
    const now = Date.now();
    const last7 = gymActivities.filter((a) => now - new Date(a.date).getTime() < 7 * DAY_MS);
    const last30 = gymActivities.filter((a) => now - new Date(a.date).getTime() < 30 * DAY_MS);
    const lastWorkout = gymActivities[0]?.date ?? null;
    const daysSinceLastWorkout = lastWorkout
      ? Math.floor((now - new Date(lastWorkout).getTime()) / DAY_MS)
      : null;
    const gymStreak = this.computeGymStreak(gymActivities);
    const minutesLast7d = last7.reduce((s, a) => s + a.duration, 0);

    // HABITS
    const completedToday = habitsToday.filter((h: any) => h.completed).length;
    const last7Completion = await this.habitsLast7dRate(userId);
    const missedStreak = await this.habitsMissedStreak(userId);

    // EVENTS
    const workoutScheduledToday = eventsToday.some((e: any) =>
      /(gym|entren|workout|pesas|cardio)/i.test(`${e.title} ${e.category?.name ?? ''}`),
    );

    // AVG 7d calories
    const avgCalories7d =
      nutRange.days.length > 0
        ? Math.round(
            nutRange.days.reduce((s, d) => s + d.totals.calories, 0) / nutRange.days.length,
          )
        : 0;

    return {
      userId,
      generatedAt: new Date().toISOString(),
      range,
      profile: {
        id: profileRaw.id,
        name: profileRaw.name,
        goal: (profileRaw.goal ?? null) as any,
        heightCm: profileRaw.heightCm ?? null,
        weightKg: profileRaw.weightKg ?? null,
        age: computeAge(profileRaw.birthdate ?? null),
      },
      sleep: {
        lastNight: sleepStats.lastNight
          ? {
              durationHours: Number((sleepStats.lastNight.durationMin / 60).toFixed(2)),
              sleepAt: sleepStats.lastNight.sleepAt.toISOString(),
              wakeAt: sleepStats.lastNight.wakeAt.toISOString(),
            }
          : null,
        avgHours7d: sleepStats.avgHours7d,
        avgHours30d: sleepStats.avgHours30d,
        trend: sleepStats.trend,
        lowSleepStreak,
      },
      gym: {
        last7dCount: last7.length,
        last30dCount: last30.length,
        lastWorkoutDate: lastWorkout ? String(lastWorkout).split('T')[0] : null,
        daysSinceLastWorkout,
        streakDays: gymStreak,
        minutesLast7d,
      },
      nutrition: {
        todayTotals: nutToday.totals,
        avgCalories7d,
        mealsToday: nutToday.meals.length,
      },
      habits: {
        today: { total: habitsToday.length, completed: completedToday },
        last7dCompletionRate: last7Completion,
        missedDaysStreak: missedStreak,
        streaks: topHabitStreaks.map((s) => ({
          habitId: s.habitId,
          name: s.name,
          streak: s.current,
        })),
      },
      finance: {
        monthSpent: financeMonth.totalSpent,
        monthIncome: financeMonth.totalIncome,
        monthRemaining: financeMonth.remaining,
        weekSpent: weekSpent.thisWeek,
        weeklyAvgSpend: weekSpent.avgWeek4,
        overWeeklyAvg: weekSpent.avgWeek4 > 0 && weekSpent.thisWeek > weekSpent.avgWeek4,
      },
      events: {
        today: eventsToday.map((e: any) => ({
          id: e.id,
          title: e.title,
          startAt: e.startAt.toISOString(),
          category: e.category?.name ?? null,
        })),
        next7d: eventsNext7,
        workoutScheduledToday,
      },
      journal: {
        today: journalToday
          ? { mood: journalToday.mood, energyLevel: journalToday.energyLevel, notes: journalToday.notes }
          : null,
        avgMood7d: journalStats.avgMood7d,
        avgEnergy7d: journalStats.avgEnergy7d,
        lowMoodStreak: journalStats.lowMoodStreak,
        entries7d: journalStats.entries7d,
      },
    };
  }

  // ── helpers ──

  private computeGymStreak(activities: GymActivity[]): number {
    if (!activities.length) return 0;
    const dates = new Set(activities.map((a) => String(a.date).split('T')[0]));
    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    while (dates.has(ymd(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  private async habitsLast7dRate(userId: string): Promise<number> {
    let scheduledSum = 0;
    let completedSum = 0;
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const list = await this.habits.getHabitsForDate(userId, ymd(d));
      scheduledSum += list.length;
      completedSum += list.filter((h: any) => h.completed).length;
    }
    return scheduledSum > 0 ? Number((completedSum / scheduledSum).toFixed(3)) : 0;
  }

  private async habitsMissedStreak(userId: string): Promise<number> {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const list = await this.habits.getHabitsForDate(userId, ymd(d));
      if (!list.length) continue;
      const anyDone = list.some((h: any) => h.completed);
      if (anyDone) break;
      streak++;
    }
    return streak;
  }

  private async eventsToday(userId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return this.events.list(userId, start.toISOString(), end.toISOString());
  }

  private async eventsUpcoming(userId: string, days: number) {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);
    const list = await this.events.list(userId, start.toISOString(), end.toISOString());
    return list.length;
  }

  private async financeMonth(userId: string) {
    const now = new Date();
    return this.finances.getMonthlySummary(userId, now.getFullYear(), now.getMonth() + 1);
  }

  private async weekSpent(userId: string) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const expenses = await this.finances.getExpensesByMonth(userId, year, month);
    const startOfWeek = new Date();
    const dow = startOfWeek.getDay();
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    startOfWeek.setDate(startOfWeek.getDate() + mondayOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeek = expenses
      .filter((e) => new Date(e.date) >= startOfWeek)
      .reduce((s, e) => s + Number(e.amount), 0);

    // average of previous 4 weeks (this month only, rough)
    const prev4 = [1, 2, 3, 4].map((w) => {
      const ws = new Date(startOfWeek);
      ws.setDate(ws.getDate() - w * 7);
      const we = new Date(ws);
      we.setDate(we.getDate() + 7);
      return expenses
        .filter((e) => {
          const d = new Date(e.date);
          return d >= ws && d < we;
        })
        .reduce((s, e) => s + Number(e.amount), 0);
    });
    const nonZero = prev4.filter((v) => v > 0);
    const avgWeek4 = nonZero.length ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 0;

    return { thisWeek, avgWeek4: Number(avgWeek4.toFixed(2)) };
  }
}
