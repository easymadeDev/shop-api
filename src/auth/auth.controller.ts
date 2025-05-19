// src/auth/auth.controller.ts

import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import { LoginStudentDto } from './dto/login-student.dto';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterStudentDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginStudentDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: Request) {
    return { id: (req.user as any).id, email: (req.user as any).email };
  }
}
