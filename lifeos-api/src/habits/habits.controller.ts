import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { SetProgressDto } from './dto/set-progress.dto';

@UseGuards(JwtAuthGuard)
@Controller('habits')
export class HabitsController {
  private readonly logger = new Logger(HabitsController.name);

  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  create(@CurrentUser() user, @Body() dto: CreateHabitDto) {
    this.logger.log(`POST /habits — user: ${user.id} | "${dto.name}" [${dto.habitType ?? 'simple'}]`);
    return this.habitsService.createHabit(user.id, dto as any);
  }

  @Get()
  getAll(@CurrentUser() user) {
    return this.habitsService.getHabits(user.id);
  }

  @Delete(':id')
  delete(@CurrentUser() user, @Param('id') id: string) {
    return this.habitsService.deleteHabit(id, user.id);
  }

  @Get('today')
  getToday(@CurrentUser() user, @Query('date') date: string) {
    const d = date || new Date().toISOString().split('T')[0];
    return this.habitsService.getHabitsForDate(user.id, d);
  }

  // Legacy toggle (dashboard)
  @Post(':id/toggle')
  toggle(@CurrentUser() user, @Param('id') id: string, @Query('date') date: string) {
    const d = date || new Date().toISOString().split('T')[0];
    return this.habitsService.toggleLog(id, d);
  }

  // Set progress (habits page)
  @Post(':id/progress')
  setProgress(@Param('id') id: string, @Body() dto: SetProgressDto) {
    return this.habitsService.setProgress(id, dto.date, dto.value ?? 0, dto.checklistState);
  }

  // Calendar for a habit
  @Get(':id/calendar')
  getCalendar(
    @Param('id') id: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const now = new Date();
    return this.habitsService.getHabitCalendar(
      id,
      parseInt(year) || now.getFullYear(),
      parseInt(month) || now.getMonth() + 1,
    );
  }

  // History for comparison
  @Get(':id/history')
  getHistory(@Param('id') id: string, @Query('days') days: string) {
    return this.habitsService.getHabitHistory(id, parseInt(days) || 14);
  }

  @Get(':id/streak')
  streak(@Param('id') id: string) {
    return this.habitsService.getStreak(id).then((s) => ({ streak: s }));
  }
}
