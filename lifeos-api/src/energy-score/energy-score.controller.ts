import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EnergyScoreService } from './energy-score.service';

@UseGuards(JwtAuthGuard)
@Controller('energy-score')
export class EnergyScoreController {
  constructor(private readonly service: EnergyScoreService) {}

  @Get()
  get(@CurrentUser() user) {
    return this.service.computeForUser(user.id);
  }
}
