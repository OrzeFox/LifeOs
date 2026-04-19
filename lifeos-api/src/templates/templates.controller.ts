import {
  Body, Controller, Delete, Get, Param, Post, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';

@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplatesController {
  constructor(private readonly service: TemplatesService) {}

  @Get()
  list(@CurrentUser() user) {
    return this.service.list(user.id);
  }

  @Post()
  create(@CurrentUser() user, @Body() dto: CreateTemplateDto) {
    return this.service.create(user.id, dto);
  }

  @Post('from-current')
  snapshot(@CurrentUser() user, @Body() body: { name: string; description?: string }) {
    return this.service.saveFromExisting(user.id, body.name, body.description ?? null);
  }

  @Post(':id/apply')
  apply(@CurrentUser() user, @Param('id') id: string) {
    return this.service.apply(id, user.id);
  }

  @Delete(':id')
  delete(@CurrentUser() user, @Param('id') id: string) {
    return this.service.delete(id, user.id);
  }
}
