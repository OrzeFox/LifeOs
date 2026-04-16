import { Injectable } from '@nestjs/common';
import { FinancesService } from '../finances/finances.service';
import { HabitsService } from '../habits/habits.service';
import { RoutineService } from '../routine/routine.service';
import { EnergyService } from '../energy/energy.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly financesService: FinancesService,
    private readonly habitsService: HabitsService,
    private readonly routineService: RoutineService,
    private readonly energyService: EnergyService,
  ) {}

  async getDaily(userId: string) {
    const today = new Date();
    const date = today.toISOString().split('T')[0];
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    const [summary, habits, meals, energy] = await Promise.all([
      this.financesService.getMonthlySummary(userId, year, month),
      this.habitsService.getHabitsForDate(userId, date),
      this.routineService.getMealsForDate(userId, date),
      this.energyService.getLogForDate(userId, date),
    ]);

    return { date, summary, habits, meals, energy };
  }
}
