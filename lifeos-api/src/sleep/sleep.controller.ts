import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SleepService } from './sleep.service';
import { CreateSleepLogDto } from './dto/create-sleep-log.dto';
import { UpdateSleepLogDto } from './dto/update-sleep-log.dto';

@UseGuards(JwtAuthGuard)
@Controller('sleep')
export class SleepController {
  private readonly logger = new Logger(SleepController.name);

  constructor(private readonly sleepService: SleepService) {}

  @Post()
  create(@CurrentUser() user, @Body() dto: CreateSleepLogDto) {
    this.logger.log(`POST /sleep — user: ${user.id} | ${dto.sleepAt} → ${dto.wakeAt}`);
    return this.sleepService.create(user.id, dto);
  }

  @Get()
  list(
    @CurrentUser() user,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    this.logger.log(`GET /sleep — user: ${user.id} | from: ${from} to: ${to}`);
    return this.sleepService.list(user.id, from, to);
  }

  @Get('stats')
  stats(@CurrentUser() user) {
    this.logger.log(`GET /sleep/stats — user: ${user.id}`);
    return this.sleepService.stats(user.id);
  }

  @Patch(':id')
  update(@CurrentUser() user, @Param('id') id: string, @Body() dto: UpdateSleepLogDto) {
    this.logger.log(`PATCH /sleep/${id} — user: ${user.id}`);
    return this.sleepService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user, @Param('id') id: string) {
    this.logger.log(`DELETE /sleep/${id} — user: ${user.id}`);
    return this.sleepService.delete(id, user.id);
  }
}
