import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PredictionsService } from './predictions.service';

@UseGuards(JwtAuthGuard)
@Controller('predictions')
export class PredictionsController {
  constructor(private readonly service: PredictionsService) {}

  @Get()
  get(@CurrentUser() user) {
    return this.service.compute(user.id);
  }
}
