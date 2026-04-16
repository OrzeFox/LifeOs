import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meal } from './meal.entity';

@Injectable()
export class RoutineService {
  constructor(
    @InjectRepository(Meal)
    private readonly mealsRepo: Repository<Meal>,
  ) {}

  createMeal(userId: string, data: Partial<Meal>) {
    const meal = this.mealsRepo.create({ ...data, user: { id: userId } });
    return this.mealsRepo.save(meal);
  }

  getMealsForDate(userId: string, date: string) {
    return this.mealsRepo.find({
      where: { user: { id: userId }, date },
      order: { scheduledTime: 'ASC' },
    });
  }

  deleteMeal(id: string, userId: string) {
    return this.mealsRepo.delete({ id, user: { id: userId } });
  }
}
