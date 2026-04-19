import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GymService } from './gym.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { GenerateRecommendationDto } from './dto/generate-recommendation.dto';
import { ActivityType } from './entities/gym-activity.entity';

@UseGuards(JwtAuthGuard)
@Controller('gym')
export class GymController {
  private readonly logger = new Logger(GymController.name);

  constructor(private readonly gymService: GymService) {}

  @Post()
  create(@CurrentUser() user, @Body() dto: CreateActivityDto) {
    this.logger.log(`POST /gym — user: ${user.id} | ${dto.activityType} ${dto.duration}min`);
    return this.gymService.create(user.id, dto as any);
  }

  @Get()
  getAll(@CurrentUser() user, @Query('type') type?: ActivityType) {
    return this.gymService.getAll(user.id, type);
  }

  @Delete(':id')
  delete(@CurrentUser() user, @Param('id') id: string) {
    this.logger.log(`DELETE /gym/${id} — user: ${user.id}`);
    return this.gymService.delete(id, user.id);
  }

  @Get('summary')
  getSummary(@CurrentUser() user) {
    return this.gymService.getSummary(user.id);
  }

  @Get('recommendations')
  getRecommendation(@CurrentUser() user) {
    this.logger.log(`GET /gym/recommendations — user: ${user.id}`);
    return this.gymService.getLatestRecommendation(user.id);
  }

  @Post('recommendations/generate')
  generateRecommendation(@CurrentUser() user, @Body() dto: GenerateRecommendationDto) {
    this.logger.log(`POST /gym/recommendations/generate — user: ${user.id}`);
    return this.gymService.generateRecommendation(user.id, dto.notes);
  }
}
