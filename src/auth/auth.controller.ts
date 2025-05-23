// src/auth/auth.controller.ts

import { Controller, Post, Body, UseGuards, Get, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import { LoginStudentDto } from './dto/login-student.dto';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { Request, Response } from 'express';

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
  async getProfile(@Req() req: Request) {
    const user = req.user as any;
    return {
      id: user.id,
      email: user.email,
    };
  }



  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res() res: Response) {
  
    res.clearCookie('isAuthenticated', {
      httpOnly: true,
      sameSite: 'lax', 
      secure: process.env.NODE_ENV === 'production', 
      path: '/'
    });

  
    return res.json({ message: 'Logged out successfully' });
  }
}
