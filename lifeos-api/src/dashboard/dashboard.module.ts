import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { FinancesModule } from '../finances/finances.module';
import { HabitsModule } from '../habits/habits.module';
import { NutritionModule } from '../nutrition/nutrition.module';
import { EnergyModule } from '../energy/energy.module';

@Module({
  imports: [FinancesModule, HabitsModule, NutritionModule, EnergyModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
