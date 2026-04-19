import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FinancesModule } from './finances/finances.module';
import { HabitsModule } from './habits/habits.module';
import { RoutineModule } from './routine/routine.module';
import { EnergyModule } from './energy/energy.module';
import { GymModule } from './gym/gym.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
        synchronize: true,
      }),
    }),
    AuthModule,
    UsersModule,
    FinancesModule,
    HabitsModule,
    RoutineModule,
    EnergyModule,
    GymModule,
    DashboardModule,
  ],
})
export class AppModule { }
