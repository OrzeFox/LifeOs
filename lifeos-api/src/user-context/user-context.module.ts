import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { SleepModule } from '../sleep/sleep.module';
import { GymModule } from '../gym/gym.module';
import { NutritionModule } from '../nutrition/nutrition.module';
import { HabitsModule } from '../habits/habits.module';
import { FinancesModule } from '../finances/finances.module';
import { EventsModule } from '../events/events.module';
import { JournalModule } from '../journal/journal.module';
import { StreaksModule } from '../streaks/streaks.module';
import { SleepLog } from '../sleep/entities/sleep-log.entity';
import { GymActivity } from '../gym/entities/gym-activity.entity';
import { HabitLog } from '../habits/entities/habit-log.entity';
import { UserContextService } from './user-context.service';
import { UserContextController } from './user-context.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SleepLog, GymActivity, HabitLog]),
    UsersModule,
    SleepModule,
    GymModule,
    NutritionModule,
    HabitsModule,
    FinancesModule,
    EventsModule,
    JournalModule,
    StreaksModule,
  ],
  controllers: [UserContextController],
  providers: [UserContextService],
  exports: [UserContextService],
})
export class UserContextModule {}
