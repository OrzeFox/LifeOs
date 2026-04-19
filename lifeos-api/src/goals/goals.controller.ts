import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly service: GoalsService) {}

  @Get()
  list(@CurrentUser() user, @Query('status') status?: string) {
    return this.service.list(user.id, status);
  }

  @Get('progress')
  progress(@CurrentUser() user) {
    return this.service.evaluateAll(user.id);
  }

  @Post()
  create(@CurrentUser() user, @Body() dto: CreateGoalDto) {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user, @Param('id') id: string, @Body() dto: UpdateGoalDto) {
    return this.service.update(id, user.id, dto);
  }

  @Delete(':id')
  delete(@CurrentUser() user, @Param('id') id: string) {
    return this.service.delete(id, user.id);
  }
}
