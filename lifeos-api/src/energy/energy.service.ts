import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { EnergyLog } from './entities/energy-log.entity';

@Injectable()
export class EnergyService {
  constructor(
    @InjectRepository(EnergyLog)
    private readonly logsRepo: Repository<EnergyLog>,
  ) {}

  async upsertLog(userId: string, date: string, level: number, notes?: string) {
    // Use TypeORM upsert — single atomic INSERT ... ON CONFLICT DO UPDATE
    // Resolves race conditions from rapid slider events firing multiple requests
    await this.logsRepo.upsert(
      {
        user: { id: userId },
        date,
        level,
        ...(notes !== undefined ? { notes } : {}),
      },
      {
        conflictPaths: ['user', 'date'],
        skipUpdateIfNoValuesChanged: true,
      },
    );
    return this.logsRepo.findOne({ where: { user: { id: userId }, date } });
  }

  getLogForDate(userId: string, date: string) {
    return this.logsRepo.findOne({ where: { user: { id: userId }, date } });
  }

  async getWeekly(userId: string, endDate: string, days = 7) {
    const end = new Date(endDate + 'T12:00:00');
    const start = new Date(end);
    start.setDate(end.getDate() - (days - 1));

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const logs = await this.logsRepo.find({
      where: { user: { id: userId }, date: Between(startStr, endStr) },
      order: { date: 'ASC' },
    });
    const logMap = new Map(logs.map((l) => [String(l.date).split('T')[0], l]));

    const series: { date: string; level: number | null }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const log = logMap.get(dateStr);
      series.push({ date: dateStr, level: log?.level ?? null });
    }

    const filled = series.filter((s) => s.level !== null).map((s) => s.level as number);
    const average = filled.length ? filled.reduce((a, b) => a + b, 0) / filled.length : 0;
    const best = filled.length ? Math.max(...filled) : 0;
    const worst = filled.length ? Math.min(...filled) : 0;

    return {
      start: startStr,
      end: endStr,
      days: series,
      average: Math.round(average * 10) / 10,
      best,
      worst,
      loggedDays: filled.length,
    };
  }
}
