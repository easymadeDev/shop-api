// src/student/student.controller.ts

import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Delete,
  Param,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from 'src/utils/cloudinary';
import { Request } from 'express';
import { Express } from 'express';
import { LoginStudentDto } from 'src/auth/dto/login-student.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';


@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('image', { storage }))
  async registerStudent(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateStudentDto,
  ) {
    return this.studentService.register(body, file);
  }

  @Post('login')
  async login(@Body() body: LoginStudentDto) {
    return this.studentService.login(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll() {
    return this.studentService.findAll();
  }
  // @UseGuards(JwtAuthGuard)
  // @Get('profile')
  // async getProfile(@Req() req: Request) {
  //   const user = req.user as { id: string };
  //   return this.studentService.getProfile(user.id);
  // }

   // Get a student by ID
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.studentService.findById(id);
  }

    // Get current user's profile
  @UseGuards(JwtAuthGuard)
  @Get('profile/me')
  getProfile(@Req() req) {
    return this.studentService.getProfile(req.user.id);
  }

  // Update profile picture
  @UseGuards(JwtAuthGuard)
  @Post('profile/upload')
  @UseInterceptors(FileInterceptor('image', { storage }))
  async uploadProfile(@UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.studentService.updateProfilePic(req.user.id, file);
  }
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Req() req) {
    return this.studentService.getProfile(req.user.id);
  }


  // @UseGuards(JwtAuthGuard)
  // @Post('upload-profile')
  // @UseInterceptors(FileInterceptor('file', { storage }))
  // async uploadProfile(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
  //   const user = req.user as { id: string };
  //   const imageUrl = file.path;
  //   return this.studentService.updateProfilePic(user.id, imageUrl);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Post('profile/upload')
  // @UseInterceptors(FileInterceptor('image'))
  // async uploadProfile(@UploadedFile() file: Express.Multer.File, @Req() req) {
  //   return this.studentService.updateProfilePic(req.user.id, file);
  // }

    // Delete a student and their profile picture
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.studentService.delete(id);
  }


}
