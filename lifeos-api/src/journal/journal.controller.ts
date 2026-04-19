import { Body, Controller, Delete, Get, Logger, Param, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JournalService } from './journal.service';
import { UpsertJournalDto } from './dto/upsert-journal.dto';

@UseGuards(JwtAuthGuard)
@Controller('journal')
export class JournalController {
  private readonly logger = new Logger(JournalController.name);

  constructor(private readonly service: JournalService) {}

  @Get()
  list(@CurrentUser() user, @Query('from') from?: string, @Query('to') to?: string) {
    const today = new Date();
    const f = from ?? new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30).toISOString().split('T')[0];
    const t = to ?? today.toISOString().split('T')[0];
    return this.service.getRange(user.id, f, t);
  }

  @Get('today')
  today(@CurrentUser() user) {
    const d = new Date().toISOString().split('T')[0];
    return this.service.getForDate(user.id, d);
  }

  @Get('stats')
  stats(@CurrentUser() user) {
    return this.service.stats(user.id);
  }

  @Get(':date')
  get(@CurrentUser() user, @Param('date') date: string) {
    return this.service.getForDate(user.id, date);
  }

  @Put(':date')
  upsert(@CurrentUser() user, @Param('date') date: string, @Body() dto: UpsertJournalDto) {
    this.logger.log(`PUT /journal/${date} — user: ${user.id} mood=${dto.mood} energy=${dto.energyLevel}`);
    return this.service.upsert(user.id, date, dto);
  }

  @Delete(':id')
  delete(@CurrentUser() user, @Param('id') id: string) {
    return this.service.delete(id, user.id);
  }
}
