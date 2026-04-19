import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { SleepLog } from './entities/sleep-log.entity';
import { CreateSleepLogDto } from './dto/create-sleep-log.dto';
import { UpdateSleepLogDto } from './dto/update-sleep-log.dto';

const MS_PER_MIN = 60_000;

@Injectable()
export class SleepService {
  constructor(
    @InjectRepository(SleepLog)
    private readonly repo: Repository<SleepLog>,
  ) {}

  private computeDuration(sleepAt: Date, wakeAt: Date): number {
    const diff = wakeAt.getTime() - sleepAt.getTime();
    if (diff <= 0) throw new BadRequestException('wakeAt must be after sleepAt');
    return Math.round(diff / MS_PER_MIN);
  }

  async create(userId: string, dto: CreateSleepLogDto) {
    const sleepAt = new Date(dto.sleepAt);
    const wakeAt = new Date(dto.wakeAt);
    const durationMin = this.computeDuration(sleepAt, wakeAt);
    const log = this.repo.create({
      user: { id: userId } as any,
      sleepAt, wakeAt, durationMin,
      notes: dto.notes,
    });
    return this.repo.save(log);
  }

  async update(id: string, userId: string, dto: UpdateSleepLogDto) {
    const log = await this.repo.findOne({ where: { id, user: { id: userId } as any } });
    if (!log) throw new NotFoundException('Sleep log not found');
    if (dto.sleepAt) log.sleepAt = new Date(dto.sleepAt);
    if (dto.wakeAt) log.wakeAt = new Date(dto.wakeAt);
    if (dto.notes !== undefined) log.notes = dto.notes;
    log.durationMin = this.computeDuration(log.sleepAt, log.wakeAt);
    return this.repo.save(log);
  }

  async delete(id: string, userId: string) {
    const result = await this.repo.delete({ id, user: { id: userId } as any });
    if (!result.affected) throw new NotFoundException('Sleep log not found');
    return { deleted: true };
  }

  list(userId: string, from?: string, to?: string) {
    const where: any = { user: { id: userId } };
    if (from && to) where.sleepAt = Between(new Date(from), new Date(to));
    return this.repo.find({ where, order: { sleepAt: 'DESC' } });
  }

  async stats(userId: string) {
    const now = new Date();
    const d7 = new Date(now); d7.setDate(now.getDate() - 7);
    const d30 = new Date(now); d30.setDate(now.getDate() - 30);

    const last = await this.repo.findOne({
      where: { user: { id: userId } as any },
      order: { sleepAt: 'DESC' },
    });

    const logs7 = await this.repo.find({
      where: { user: { id: userId } as any, sleepAt: Between(d7, now) },
    });
    const logs30 = await this.repo.find({
      where: { user: { id: userId } as any, sleepAt: Between(d30, now) },
    });

    const avg = (arr: SleepLog[]) =>
      arr.length ? arr.reduce((s, l) => s + l.durationMin, 0) / arr.length / 60 : 0;

    const avg7 = avg(logs7);
    const avg30 = avg(logs30);

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (avg7 - avg30 > 0.5) trend = 'improving';
    else if (avg30 - avg7 > 0.5) trend = 'declining';

    const suggestions: string[] = [];
    if (avg7 && avg7 < 6) suggestions.push('Duermes menos de 6h en promedio. Considera acostarte 30 min más temprano.');
    if (avg7 && avg7 > 9) suggestions.push('Duermes más de 9h. Revisa calidad del sueño.');
    if (!suggestions.length && avg7) suggestions.push('Tu promedio de sueño es saludable. Mantén el ritmo.');

    return {
      lastNight: last,
      avgHours7d: Number(avg7.toFixed(2)),
      avgHours30d: Number(avg30.toFixed(2)),
      trend,
      suggestions,
    };
  }
}
