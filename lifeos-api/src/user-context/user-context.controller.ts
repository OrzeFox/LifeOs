import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserContextService } from './user-context.service';

@UseGuards(JwtAuthGuard)
@Controller('user-context')
export class UserContextController {
  private readonly logger = new Logger(UserContextController.name);

  constructor(private readonly service: UserContextService) {}

  @Get()
  get(@CurrentUser() user, @Query('days') days?: string) {
    const n = days ? Math.max(1, Math.min(90, Number(days))) : 7;
    this.logger.log(`GET /user-context — user: ${user.id} | days=${n}`);
    return this.service.build(user.id, { days: n });
  }
}
