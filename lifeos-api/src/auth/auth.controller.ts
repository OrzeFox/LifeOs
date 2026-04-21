import { Controller, Post, Get, Body, Logger, UseGuards, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) { }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    this.logger.log(`POST /auth/register — email: ${dto.email}`);
    return this.authService.register(dto.email, dto.password, dto.name);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    this.logger.log(`POST /auth/login — email: ${dto.email}`);
    return this.authService.login(dto.email, dto.password);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    this.logger.log('GET /auth/google - iniciando OAuth Google');
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req, @Res() res: Response) {
    this.logger.log(`GET /auth/google/callback - token emitido`);
    const redirectUrl = `https://life-os-teal-zeta.vercel.app/login?access_token=${req.user.access_token}`;
    res.redirect(redirectUrl);
  }
}
