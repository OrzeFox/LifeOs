import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JournalEntry } from './entities/journal-entry.entity';
import { UpsertJournalDto } from './dto/upsert-journal.dto';
import { DomainEvents, type DomainEventPayload } from '../smart-alerts/events';

export interface JournalStats {
  avgMood7d: number;
  avgEnergy7d: number;
  avgMood30d: number;
  avgEnergy30d: number;
  lowMoodStreak: number;   // consecutive days with mood <= 4
  entries7d: number;
}

@Injectable()
export class JournalService {
  constructor(
    @InjectRepository(JournalEntry)
    private readonly repo: Repository<JournalEntry>,
    private readonly events: EventEmitter2,
  ) {}

  async upsert(userId: string, date: string, dto: UpsertJournalDto) {
    let entry = await this.repo.findOne({
      where: { user: { id: userId }, date },
    });
    if (entry) {
      entry.mood = dto.mood;
      entry.energyLevel = dto.energyLevel;
      entry.notes = dto.notes ?? null;
    } else {
      entry = this.repo.create({
        user: { id: userId },
        date,
        mood: dto.mood,
        energyLevel: dto.energyLevel,
        notes: dto.notes ?? null,
      });
    }
    const saved = await this.repo.save(entry);
    const payload: DomainEventPayload = {
      userId,
      event: DomainEvents.JournalUpserted,
      at: new Date().toISOString(),
      meta: { date, mood: saved.mood, energyLevel: saved.energyLevel },
    };
    this.events.emit(DomainEvents.JournalUpserted, payload);
    return saved;
  }

  async getForDate(userId: string, date: string) {
    return this.repo.findOne({ where: { user: { id: userId }, date } });
  }

  async getRange(userId: string, from: string, to: string) {
    return this.repo.find({
      where: { user: { id: userId }, date: Between(from, to) },
      order: { date: 'DESC' },
    });
  }

  async delete(id: string, userId: string) {
    const res = await this.repo.delete({ id, user: { id: userId } });
    if (!res.affected) throw new NotFoundException('Journal entry not found');
    return { deleted: true };
  }

  async stats(userId: string): Promise<JournalStats> {
    const now = new Date();
    const ymd = (d: Date) => d.toISOString().split('T')[0];
    const d7 = new Date(now); d7.setDate(now.getDate() - 7);
    const d30 = new Date(now); d30.setDate(now.getDate() - 30);

    const [last7, last30] = await Promise.all([
      this.repo.find({
        where: { user: { id: userId }, date: Between(ymd(d7), ymd(now)) },
      }),
      this.repo.find({
        where: { user: { id: userId }, date: Between(ymd(d30), ymd(now)) },
      }),
    ]);

    const avg = (arr: JournalEntry[], key: 'mood' | 'energyLevel') =>
      arr.length
        ? Number((arr.reduce((s, e) => s + e[key], 0) / arr.length).toFixed(2))
        : 0;

    // low-mood streak: consecutive recent days (most recent first) with mood <= 4
    const sorted = [...last30].sort((a, b) => (a.date > b.date ? -1 : 1));
    let lowMoodStreak = 0;
    for (const e of sorted) {
      if (e.mood <= 4) lowMoodStreak++;
      else break;
    }

    return {
      avgMood7d: avg(last7, 'mood'),
      avgEnergy7d: avg(last7, 'energyLevel'),
      avgMood30d: avg(last30, 'mood'),
      avgEnergy30d: avg(last30, 'energyLevel'),
      lowMoodStreak,
      entries7d: last7.length,
    };
  }
}
