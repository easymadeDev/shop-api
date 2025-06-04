

import { Controller, Post, Get, Body, Req, UploadedFile, UseGuards, UseInterceptors, Delete, Param, Res, Patch } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from '../utils/cloudinary';
import { Request, Response } from 'express';
import { Express } from 'express';
import { LoginStudentDto } from 'src/auth/dto/login-student.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';


@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('image', { storage }))
  async registerStudent(
    @UploadedFile() file: Express.Multer.File,
    @Body() CreateStudentDto: CreateStudentDto) {
    return this.studentService.register(CreateStudentDto, file);
  }

  @Post('login')
  async login(@Body() CreateStudentDto: LoginStudentDto, @Res() res: Response) {
    return this.studentService.login(CreateStudentDto, res);


  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super admin')
  @Get()
  findAll() {
    return this.studentService.findAll();
  }


   // Get a student by ID
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super admin')
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.studentService.findById(id);
  }

    // Get current user's profile
  @UseGuards(JwtAuthGuard)
  @Get('profile/me')
  getProfile(@Req() req) {
 
   return req.user;
  }

  // Update profile picture
  @UseGuards(JwtAuthGuard)
  @Patch('profile/updatepics')
  @UseInterceptors(FileInterceptor('image', { storage }))
  async uploadProfile(@UploadedFile() file: Express.Multer.File, 
  @Req() req: Request) {
   const user = req.user as { id: string };

    return this.studentService.updateProfilePic(user.id, file);
    
  }

@UseGuards(JwtAuthGuard)
@UseInterceptors(FileInterceptor('profilePic'))
@Post('updateinfo')
async updateStudentInfo(
  @Req() req,
  @UploadedFile() file: Express.Multer.File,
  @Body() body: any
) {
  const updateData: Partial<CreateStudentDto> = {};

  if (body.fullName) updateData.fullName = body.fullName;
  if (body.email) updateData.email = body.email;
  if (body.password) updateData.password = body.password;
  if (body.role) updateData.role = body.role;
  if (file) updateData.profilePic = file.path;

  return this.studentService.updateStudent(req.user.id, updateData);
}


@UseGuards(JwtAuthGuard, RolesGuard)

@Roles('admin', 'super admin')
@Patch('resetpassword/:id')
async resetPassword(@Param('id') id: string, @Body('newPassword') newPassword: string) {
  return this.studentService.resetPassword(id, newPassword);
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super admin')
@Patch('block/:id')
blockStudent(@Param('id') id: string) {
  return this.studentService.blockStudent(id);
}
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super admin')
@Patch('unblock/:id')
unblockStudent(@Param('id') id: string) {
  return this.studentService.unblockStudent(id);
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super admin')
@Get('status/blocked')
async getBlockedStudents() {
 return this.studentService.findBlockedStudents();
}


    // Delete a student and their profile picture
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super admin')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.studentService.delete(id);
  }
 @Post('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    return this.studentService.logout(req, res);

    
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles( 'super admin')
@Patch('promote/:id')
async promoteToAdmin(@Param('id') id: string) {
  return this.studentService.promoteToAdmin(id);
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super admin')
@Patch('depromote/:id')
async depromoteToStudent(@Param('id') id: string) {
  return this.studentService.depromoteToStudent(id);
}


}
