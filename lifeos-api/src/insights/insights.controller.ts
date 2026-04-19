import { Controller, Delete, Get, Logger, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { InsightsService } from './insights.service';

@UseGuards(JwtAuthGuard)
@Controller('insights')
export class InsightsController {
  private readonly logger = new Logger(InsightsController.name);

  constructor(private readonly service: InsightsService) {}

  @Get()
  list(
    @CurrentUser() user,
    @Query('unread') unread?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.list(user.id, {
      unreadOnly: unread === 'true' || unread === '1',
      limit: limit ? Math.min(200, Number(limit)) : 50,
    });
  }

  @Post('run')
  run(@CurrentUser() user) {
    this.logger.log(`POST /insights/run — user: ${user.id}`);
    return this.service.runForUser(user.id);
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user, @Param('id') id: string) {
    return this.service.markRead(id, user.id);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user) {
    return this.service.markAllRead(user.id);
  }

  @Delete(':id')
  delete(@CurrentUser() user, @Param('id') id: string) {
    return this.service.delete(id, user.id);
  }
}
