import { Controller, Get, Patch, Body, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user) {
    this.logger.log(`GET /users/me — user: ${user.id}`);
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user, @Body() dto: UpdateProfileDto) {
    this.logger.log(`PATCH /users/me — user: ${user.id} | keys: ${Object.keys(dto).join(',')}`);
    return this.usersService.updateProfile(user.id, dto);
  }
}
