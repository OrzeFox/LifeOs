import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { IsString, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { HabitsService } from './habits.service';

class CreateHabitDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('habits')
export class HabitsController {
  private readonly logger = new Logger(HabitsController.name);

  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  create(@CurrentUser() user, @Body() dto: CreateHabitDto) {
    this.logger.log(`POST /habits — user: ${user.id} | "${dto.name}"`);
    return this.habitsService.createHabit(user.id, dto);
  }

  @Get()
  getAll(@CurrentUser() user) {
    this.logger.log(`GET /habits — user: ${user.id}`);
    return this.habitsService.getHabits(user.id);
  }

  @Delete(':id')
  delete(@CurrentUser() user, @Param('id') id: string) {
    this.logger.log(`DELETE /habits/${id} — user: ${user.id}`);
    return this.habitsService.deleteHabit(id, user.id);
  }

  @Get('today')
  getToday(@CurrentUser() user, @Query('date') date: string) {
    const d = date || new Date().toISOString().split('T')[0];
    this.logger.log(`GET /habits/today — user: ${user.id} | date: ${d}`);
    return this.habitsService.getHabitsForDate(user.id, d);
  }

  @Post(':id/toggle')
  toggle(@CurrentUser() user, @Param('id') id: string, @Query('date') date: string) {
    const d = date || new Date().toISOString().split('T')[0];
    this.logger.log(`POST /habits/${id}/toggle — user: ${user.id} | date: ${d}`);
    return this.habitsService.toggleLog(id, d);
  }

  @Get(':id/streak')
  streak(@CurrentUser() user, @Param('id') id: string) {
    this.logger.log(`GET /habits/${id}/streak — user: ${user.id}`);
    return this.habitsService.getStreak(id).then(s => ({ streak: s }));
  }
}
