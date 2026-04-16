import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { IsString, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RoutineService } from './routine.service';

class CreateMealDto {
  @IsString() name: string;
  @IsOptional() @IsString() scheduledTime?: string;
  @IsOptional() @IsString() description?: string;
  @IsString() date: string;
}

@UseGuards(JwtAuthGuard)
@Controller('routine')
export class RoutineController {
  private readonly logger = new Logger(RoutineController.name);

  constructor(private readonly routineService: RoutineService) {}

  @Post('meals')
  create(@CurrentUser() user, @Body() dto: CreateMealDto) {
    this.logger.log(`POST /routine/meals — user: ${user.id} | "${dto.name}" ${dto.scheduledTime ?? '--'} date: ${dto.date}`);
    return this.routineService.createMeal(user.id, dto);
  }

  @Get('meals')
  getByDate(@CurrentUser() user, @Query('date') date: string) {
    const d = date || new Date().toISOString().split('T')[0];
    this.logger.log(`GET /routine/meals — user: ${user.id} | date: ${d}`);
    return this.routineService.getMealsForDate(user.id, d);
  }

  @Delete('meals/:id')
  delete(@CurrentUser() user, @Param('id') id: string) {
    this.logger.log(`DELETE /routine/meals/${id} — user: ${user.id}`);
    return this.routineService.deleteMeal(id, user.id);
  }
}
