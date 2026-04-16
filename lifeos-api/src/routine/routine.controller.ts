import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RoutineService } from './routine.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';

@UseGuards(JwtAuthGuard)
@Controller('routine')
export class RoutineController {
  private readonly logger = new Logger(RoutineController.name);

  constructor(private readonly routineService: RoutineService) {}

  @Post('meals')
  create(@CurrentUser() user, @Body() dto: CreateMealDto) {
    this.logger.log(`POST /routine/meals — user: ${user.id} | [${dto.mealType}] date: ${dto.date}`);
    return this.routineService.createMeal(user.id, dto as any);
  }

  @Get('meals')
  getByDate(@CurrentUser() user, @Query('date') date: string) {
    const d = date || new Date().toISOString().split('T')[0];
    this.logger.log(`GET /routine/meals — user: ${user.id} | date: ${d}`);
    return this.routineService.getMealsForDate(user.id, d);
  }

  @Get('meals/summary')
  getSummary(@CurrentUser() user, @Query('date') date: string) {
    const d = date || new Date().toISOString().split('T')[0];
    return this.routineService.getDailySummary(user.id, d);
  }

  @Get('meals/history')
  getHistory(@CurrentUser() user) {
    return this.routineService.getDatesWithMeals(user.id);
  }

  @Patch('meals/:id')
  update(@CurrentUser() user, @Param('id') id: string, @Body() dto: UpdateMealDto) {
    this.logger.log(`PATCH /routine/meals/${id} — user: ${user.id}`);
    return this.routineService.updateMeal(id, user.id, dto as any);
  }

  @Delete('meals/:id')
  delete(@CurrentUser() user, @Param('id') id: string) {
    this.logger.log(`DELETE /routine/meals/${id} — user: ${user.id}`);
    return this.routineService.deleteMeal(id, user.id);
  }
}
