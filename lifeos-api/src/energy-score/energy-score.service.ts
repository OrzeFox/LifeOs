import { Injectable, Logger } from '@nestjs/common';
import { UserContextService } from '../user-context/user-context.service';
import type { UserContext } from '../user-context/types';
import type { EnergyBand, EnergyComponent, EnergyScore } from './types';

const SLEEP_TARGET_HOURS = 7.5;

@Injectable()
export class EnergyScoreService {
  private readonly logger = new Logger(EnergyScoreService.name);

  constructor(private readonly context: UserContextService) {}

  async computeForUser(userId: string): Promise<EnergyScore> {
    const ctx = await this.context.build(userId);
    const components: EnergyComponent[] = [
      scoreSleep(ctx),
      scoreSelf(ctx),
      scoreHabits(ctx),
      scoreActivity(ctx),
      scoreMood(ctx),
      scoreFinance(ctx),
    ];

    const total = Math.round(components.reduce((s, c) => s + c.score, 0));
    const band = toBand(total);

    return {
      userId,
      date: new Date().toISOString().split('T')[0],
      total,
      band,
      components,
      generatedAt: new Date().toISOString(),
    };
  }
}

function scoreSleep(ctx: UserContext): EnergyComponent {
  const hours = ctx.sleep.lastNight?.durationHours ?? null;
  const max = 25;
  if (hours == null) {
    return { key: 'sleep', label: 'Sueño', score: 0, max, note: 'Sin registro de anoche' };
  }
  const ratio = Math.max(0, Math.min(1, hours / SLEEP_TARGET_HOURS));
  const score = ratio * max;
  return {
    key: 'sleep',
    label: 'Sueño',
    score,
    max,
    note: `${hours.toFixed(1)}h / ${SLEEP_TARGET_HOURS}h`,
  };
}

function scoreSelf(ctx: UserContext): EnergyComponent {
  const max = 20;
  const todayLevel = ctx.journal.today?.energyLevel ?? null;
  if (todayLevel != null) {
    return {
      key: 'self',
      label: 'Energía subjetiva',
      score: (todayLevel / 10) * max,
      max,
      note: `Hoy: ${todayLevel}/10`,
    };
  }
  if (ctx.journal.avgEnergy7d > 0) {
    return {
      key: 'self',
      label: 'Energía subjetiva',
      score: (ctx.journal.avgEnergy7d / 10) * max * 0.7,
      max,
      note: `7d avg: ${ctx.journal.avgEnergy7d.toFixed(1)}/10`,
    };
  }
  return { key: 'self', label: 'Energía subjetiva', score: 0, max, note: 'Registra en journal' };
}

function scoreHabits(ctx: UserContext): EnergyComponent {
  const max = 20;
  const { total, completed } = ctx.habits.today;
  if (total === 0) {
    return { key: 'habits', label: 'Hábitos', score: max * 0.5, max, note: 'Sin hábitos activos' };
  }
  const rate = completed / total;
  return {
    key: 'habits',
    label: 'Hábitos',
    score: rate * max,
    max,
    note: `${completed}/${total} hoy`,
  };
}

function scoreActivity(ctx: UserContext): EnergyComponent {
  const max = 15;
  const days = ctx.gym.daysSinceLastWorkout;
  if (days == null) {
    return { key: 'activity', label: 'Actividad', score: 0, max, note: 'Sin entrenamientos' };
  }
  const table: Record<number, number> = { 0: 15, 1: 12, 2: 9, 3: 6, 4: 3 };
  const score = days >= 5 ? 0 : table[days] ?? 0;
  return {
    key: 'activity',
    label: 'Actividad',
    score,
    max,
    note: days === 0 ? 'Entrenaste hoy' : `Hace ${days}d`,
  };
}

function scoreMood(ctx: UserContext): EnergyComponent {
  const max = 10;
  const today = ctx.journal.today?.mood ?? null;
  if (today != null) {
    return {
      key: 'mood',
      label: 'Ánimo',
      score: (today / 10) * max,
      max,
      note: `Hoy: ${today}/10`,
    };
  }
  if (ctx.journal.avgMood7d > 0) {
    return {
      key: 'mood',
      label: 'Ánimo',
      score: (ctx.journal.avgMood7d / 10) * max * 0.7,
      max,
      note: `7d avg: ${ctx.journal.avgMood7d.toFixed(1)}/10`,
    };
  }
  return { key: 'mood', label: 'Ánimo', score: 0, max, note: 'Registra en journal' };
}

function scoreFinance(ctx: UserContext): EnergyComponent {
  const max = 10;
  if (ctx.finance.overWeeklyAvg) {
    return {
      key: 'finance',
      label: 'Finanzas',
      score: 3,
      max,
      note: 'Sobre el promedio semanal',
    };
  }
  return { key: 'finance', label: 'Finanzas', score: max, max, note: 'Gasto bajo control' };
}

function toBand(total: number): EnergyBand {
  if (total >= 80) return 'peak';
  if (total >= 60) return 'high';
  if (total >= 40) return 'medium';
  return 'low';
}
