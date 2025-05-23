

import { Controller, Post, Get, Body, Req, UploadedFile, UseGuards, UseInterceptors, Delete, Param, Res, Patch } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from 'src/utils/cloudinary';
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
  async login(@Body() CreateStudentDto: LoginStudentDto) {
    return this.studentService.login(CreateStudentDto);


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
@Roles('admin')
@Patch('resetpassword/:id')
async resetPassword(@Param('id') id: string, @Body('newPassword') newPassword: string) {
  return this.studentService.resetPassword(id, newPassword);
}

  // @UseGuards(JwtAuthGuard)
  // @Get('profile')
  // profile(@Req() req) {
  //   return this.studentService.getProfile(req.user.id);
  // }


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
 @Post('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    return this.studentService.logout(req, res);

    
  }

}
