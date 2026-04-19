import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NutritionService } from './nutrition.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';

@UseGuards(JwtAuthGuard)
@Controller('nutrition')
export class NutritionController {
  private readonly logger = new Logger(NutritionController.name);

  constructor(private readonly nutrition: NutritionService) {}

  @Post('meals')
  create(@CurrentUser() user, @Body() dto: CreateMealDto) {
    this.logger.log(`POST /nutrition/meals — user: ${user.id} | [${dto.mealType}] date: ${dto.date}`);
    return this.nutrition.createMeal(user.id, dto as any);
  }

  @Get('meals')
  getByDate(@CurrentUser() user, @Query('date') date: string) {
    const d = date || new Date().toISOString().split('T')[0];
    return this.nutrition.getMealsForDate(user.id, d);
  }

  @Get('meals/summary')
  getSummary(@CurrentUser() user, @Query('date') date: string) {
    const d = date || new Date().toISOString().split('T')[0];
    return this.nutrition.getDailySummary(user.id, d);
  }

  @Get('meals/history')
  getHistory(@CurrentUser() user) {
    return this.nutrition.getDatesWithMeals(user.id);
  }

  @Patch('meals/:id')
  update(@CurrentUser() user, @Param('id') id: string, @Body() dto: UpdateMealDto) {
    this.logger.log(`PATCH /nutrition/meals/${id} — user: ${user.id}`);
    return this.nutrition.updateMeal(id, user.id, dto as any);
  }

  @Delete('meals/:id')
  delete(@CurrentUser() user, @Param('id') id: string) {
    this.logger.log(`DELETE /nutrition/meals/${id} — user: ${user.id}`);
    return this.nutrition.deleteMeal(id, user.id);
  }
}
