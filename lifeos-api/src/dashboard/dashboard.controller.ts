import { Controller, Get, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDaily(@CurrentUser() user) {
    this.logger.log(`GET /dashboard — user: ${user.id}`);
    return this.dashboardService.getDaily(user.id);
  }
}
