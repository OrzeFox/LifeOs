import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Habit } from '../habits/entities/habit.entity';
import { HabitLog } from '../habits/entities/habit-log.entity';
import { GymActivity } from '../gym/entities/gym-activity.entity';
import { SleepLog } from '../sleep/entities/sleep-log.entity';
import { JournalEntry } from '../journal/entities/journal-entry.entity';
import { StreaksService } from './streaks.service';
import { StreaksController } from './streaks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Habit, HabitLog, GymActivity, SleepLog, JournalEntry])],
  controllers: [StreaksController],
  providers: [StreaksService],
  exports: [StreaksService],
})
export class StreaksModule {}
