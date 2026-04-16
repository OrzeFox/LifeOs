import { Controller, Get, Post, Body, Query, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EnergyService } from './energy.service';
import { UpsertEnergyDto } from './dto/upsert-energy.dto';

@UseGuards(JwtAuthGuard)
@Controller('energy')
export class EnergyController {
  private readonly logger = new Logger(EnergyController.name);

  constructor(private readonly energyService: EnergyService) {}

  @Post()
  upsert(@CurrentUser() user, @Body() dto: UpsertEnergyDto) {
    this.logger.log(`POST /energy — user: ${user.id} | level: ${dto.level}/10 date: ${dto.date}`);
    return this.energyService.upsertLog(user.id, dto.date, dto.level, dto.notes);
  }

  @Get()
  getForDate(@CurrentUser() user, @Query('date') date: string) {
    const d = date || new Date().toISOString().split('T')[0];
    this.logger.log(`GET /energy — user: ${user.id} | date: ${d}`);
    return this.energyService.getLogForDate(user.id, d);
  }
}
