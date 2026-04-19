import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FinancesModule } from './finances/finances.module';
import { HabitsModule } from './habits/habits.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { EnergyModule } from './energy/energy.module';
import { GymModule } from './gym/gym.module';
import { SleepModule } from './sleep/sleep.module';
import { EventsModule } from './events/events.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { JournalModule } from './journal/journal.module';
import { StreaksModule } from './streaks/streaks.module';
import { UserContextModule } from './user-context/user-context.module';
import { InsightsModule } from './insights/insights.module';
import { EnergyScoreModule } from './energy-score/energy-score.module';
import { SmartAlertsModule } from './smart-alerts/smart-alerts.module';
import { GoalsModule } from './goals/goals.module';
import { PredictionsModule } from './predictions/predictions.module';
import { TemplatesModule } from './templates/templates.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        ssl: { rejectUnauthorized: false },
        extra: { family: 4 },
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
    }),
    AuthModule,
    UsersModule,
    FinancesModule,
    HabitsModule,
    NutritionModule,
    EnergyModule,
    GymModule,
    SleepModule,
    EventsModule,
    DashboardModule,
    JournalModule,
    StreaksModule,
    UserContextModule,
    InsightsModule,
    EnergyScoreModule,
    SmartAlertsModule,
    GoalsModule,
    PredictionsModule,
    TemplatesModule,
  ],
})
export class AppModule { }
