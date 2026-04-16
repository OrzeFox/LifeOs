import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { FinancesModule } from '../finances/finances.module';
import { HabitsModule } from '../habits/habits.module';
import { RoutineModule } from '../routine/routine.module';
import { EnergyModule } from '../energy/energy.module';

@Module({
  imports: [FinancesModule, HabitsModule, RoutineModule, EnergyModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
