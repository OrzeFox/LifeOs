import { Controller, Get, Logger, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { StreaksService } from './streaks.service';

@UseGuards(JwtAuthGuard)
@Controller('streaks')
export class StreaksController {
  private readonly logger = new Logger(StreaksController.name);

  constructor(private readonly service: StreaksService) {}

  @Get()
  getAll(@CurrentUser() user) {
    return this.service.getAll(user.id);
  }
}
