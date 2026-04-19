import { Injectable } from '@nestjs/common';
import { FinancesService } from '../finances/finances.service';
import { HabitsService } from '../habits/habits.service';
import { NutritionService } from '../nutrition/nutrition.service';
import { EnergyService } from '../energy/energy.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly financesService: FinancesService,
    private readonly habitsService: HabitsService,
    private readonly nutritionService: NutritionService,
    private readonly energyService: EnergyService,
  ) {}

  async getDaily(userId: string) {
    const today = new Date();
    const date = today.toISOString().split('T')[0];
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    const [summary, habits, meals, energy, energyWeekly] = await Promise.all([
      this.financesService.getMonthlySummary(userId, year, month),
      this.habitsService.getHabitsForDate(userId, date),
      this.nutritionService.getMealsForDate(userId, date),
      this.energyService.getLogForDate(userId, date),
      this.energyService.getWeekly(userId, date),
    ]);

    return { date, summary, habits, meals, energy, energyWeekly };
  }
}
