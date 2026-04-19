import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Meal } from './entities/meal.entity';
import { NutritionAnalyzerService } from './nutrition-analyzer.service';

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

@Injectable()
export class NutritionService {
  constructor(
    @InjectRepository(Meal)
    private readonly mealsRepo: Repository<Meal>,
    private readonly analyzer: NutritionAnalyzerService,
  ) {}

  async createMeal(userId: string, data: Partial<Meal>) {
    const nutrition = data.description
      ? await this.analyzer.analyze(data.description)
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

  getMealsInRange(userId: string, from: string, to: string) {
    return this.mealsRepo.find({
      where: { user: { id: userId }, date: Between(from, to) },
      order: { date: 'ASC', scheduledTime: 'ASC' },
    });
  }

  async updateMeal(id: string, userId: string, data: Partial<Meal>) {
    const meal = await this.mealsRepo.findOne({ where: { id, user: { id: userId } } });
    if (!meal) return null;

    if (data.description !== undefined && data.description !== meal.description) {
      const nutrition = await this.analyzer.analyze(data.description);
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

  sumMacros(meals: Meal[]): MacroTotals {
    const sum = (key: keyof MacroTotals) =>
      meals.reduce((acc, m) => acc + (Number((m as any)[key]) || 0), 0);
    return {
      calories: Math.round(sum('calories')),
      protein:  Math.round(sum('protein')),
      carbs:    Math.round(sum('carbs')),
      fat:      Math.round(sum('fat')),
      fiber:    Math.round(sum('fiber')),
    };
  }

  async getDailySummary(userId: string, date: string) {
    const meals = await this.getMealsForDate(userId, date);
    return { date, meals, totals: this.sumMacros(meals) };
  }

  async getRangeSummary(userId: string, from: string, to: string) {
    const meals = await this.getMealsInRange(userId, from, to);
    const byDate = new Map<string, Meal[]>();
    for (const m of meals) {
      const key = String(m.date).split('T')[0];
      const arr = byDate.get(key) ?? [];
      arr.push(m);
      byDate.set(key, arr);
    }
    const days = Array.from(byDate.entries()).map(([date, items]) => ({
      date,
      totals: this.sumMacros(items),
      mealCount: items.length,
    }));
    return { from, to, days, totals: this.sumMacros(meals) };
  }
}
