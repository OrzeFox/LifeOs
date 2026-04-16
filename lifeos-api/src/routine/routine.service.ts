import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meal } from './entities/meal.entity';
import { NutritionService } from './nutrition.service';

@Injectable()
export class RoutineService {
  constructor(
    @InjectRepository(Meal)
    private readonly mealsRepo: Repository<Meal>,
    private readonly nutritionService: NutritionService,
  ) {}

  async createMeal(userId: string, data: Partial<Meal>) {
    const nutrition = data.description
      ? await this.nutritionService.analyze(data.description)
      : null;

    const meal = this.mealsRepo.create({
      ...data,
      ...(nutrition ?? {}),
      user: { id: userId },
    });
    return this.mealsRepo.save(meal);
  }

  getMealsForDate(userId: string, date: string) {
    return this.mealsRepo.find({
      where: { user: { id: userId }, date },
      order: { scheduledTime: 'ASC' },
    });
  }

  async updateMeal(id: string, userId: string, data: Partial<Meal>) {
    const meal = await this.mealsRepo.findOne({ where: { id, user: { id: userId } } });
    if (!meal) return null;

    if (data.description !== undefined && data.description !== meal.description) {
      const nutrition = await this.nutritionService.analyze(data.description);
      if (nutrition) Object.assign(data, nutrition);
    }

    Object.assign(meal, data);
    return this.mealsRepo.save(meal);
  }

  deleteMeal(id: string, userId: string) {
    return this.mealsRepo.delete({ id, user: { id: userId } });
  }

  async getDatesWithMeals(userId: string, limit = 30): Promise<string[]> {
    const rows = await this.mealsRepo
      .createQueryBuilder('meal')
      .select('DISTINCT meal.date', 'date')
      .where('meal.user_id = :userId', { userId })
      .orderBy('meal.date', 'DESC')
      .limit(limit)
      .getRawMany();
    return rows.map((r) => {
      const d = r.date;
      if (d instanceof Date) return d.toISOString().split('T')[0];
      return String(d).split('T')[0];
    });
  }

  async getDailySummary(userId: string, date: string) {
    const meals = await this.getMealsForDate(userId, date);
    const sum = (key: keyof Meal) =>
      meals.reduce((acc, m) => acc + (Number(m[key]) || 0), 0);

    return {
      date,
      meals,
      totals: {
        calories: Math.round(sum('calories')),
        protein:  Math.round(sum('protein')),
        carbs:    Math.round(sum('carbs')),
        fat:      Math.round(sum('fat')),
        fiber:    Math.round(sum('fiber')),
      },
    };
  }
}
