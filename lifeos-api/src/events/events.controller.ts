import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateEventCategoryDto } from './dto/create-category.dto';

@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventsService: EventsService) {}

  @Get()
  list(
    @CurrentUser() user,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('category') category?: string,
  ) {
    this.logger.log(`GET /events — user: ${user.id} | ${from}..${to} cat: ${category}`);
    return this.eventsService.list(user.id, from, to, category);
  }

  @Get('upcoming')
  upcoming(@CurrentUser() user, @Query('limit') limit?: string) {
    const n = limit ? parseInt(limit) : 5;
    this.logger.log(`GET /events/upcoming — user: ${user.id} | limit: ${n}`);
    return this.eventsService.upcoming(user.id, n);
  }

  @Post()
  create(@CurrentUser() user, @Body() dto: CreateEventDto) {
    this.logger.log(`POST /events — user: ${user.id} | "${dto.title}"`);
    return this.eventsService.create(user.id, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user, @Param('id') id: string, @Body() dto: UpdateEventDto) {
    this.logger.log(`PATCH /events/${id} — user: ${user.id}`);
    return this.eventsService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user, @Param('id') id: string) {
    this.logger.log(`DELETE /events/${id} — user: ${user.id}`);
    return this.eventsService.delete(id, user.id);
  }

  @Get('categories')
  listCategories(@CurrentUser() user) {
    return this.eventsService.listCategories(user.id);
  }

  @Post('categories')
  createCategory(@CurrentUser() user, @Body() dto: CreateEventCategoryDto) {
    this.logger.log(`POST /events/categories — user: ${user.id} | "${dto.name}"`);
    return this.eventsService.createCategory(user.id, dto);
  }

  @Post('sync/google')
  syncGoogle(
    @CurrentUser() user,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    this.logger.log(`POST /events/sync/google — user: ${user.id}`);
    return this.eventsService.syncFromGoogle(user.id, new Date(from), new Date(to));
  }
}
