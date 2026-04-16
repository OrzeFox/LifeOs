import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnergyLog } from './energy-log.entity';

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
}
