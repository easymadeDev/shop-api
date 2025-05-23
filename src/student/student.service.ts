// src/student/student.service.ts

import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Student, StudentDocument } from './entities/student.entity';
import { Model } from 'mongoose';
import { CreateStudentDto } from './dto/create-student.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

import cloudinary from 'src/utils/cloudinary';
import { LoginStudentDto } from 'src/auth/dto/login-student.dto';

@Injectable()
export class StudentService {
   // const token = this.jwtService.sign({ id: student._id, email: student.email });
  // return { token };
    constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    // private jwtService: JwtService,
  ) {}

  // async register(dto: CreateStudentDto, file: Express.Multer.File) {
  //   const hashedPassword = await bcrypt.hash(dto.password, 10);
  //   const uploaded = await cloudinary.uploader.upload(file.path);
  //   const student = new this.studentModel({
  //     ...dto,
  //     password: hashedPassword,
  //     profilePic: uploaded.secure_url,
  //     cloudinaryId: uploaded.public_id,
  //   });
  //   return { message: 'Registered successfully', student };
  // }


  async register(dto: CreateStudentDto, file?: Express.Multer.File) {
  const existing = await this.studentModel.findOne({ email: dto.email });
  if (existing) throw new BadRequestException('Email already exists');

  const hashed = await bcrypt.hash(dto.password, 10);
  // const imageUrl = file ? (await cloudinary.uploader.upload(file.path)).secure_url : '';
    let imageUrl = '';
  let cloudinaryId = '';

  if (file) {
    imageUrl = file.path; 
    cloudinaryId = (file as any).filename || ''; 
  }

  await this.studentModel.create({
    ...dto,
    password: hashed,
    profilePic: imageUrl, cloudinaryId,
    role: dto.role || 'student',
  });


  return { message: 'Registered successfully' };
}
  async login(dto: LoginStudentDto) {
    const student = await this.studentModel.findOne({ email: dto.email });
    if (!student) throw new UnauthorizedException('Invalid email');

    const isMatch = await bcrypt.compare(dto.password, student.password);
    if (!isMatch) throw new UnauthorizedException('Invalid password');

    // const token = this.jwtService.sign({ id: student._id, email: student.email });
    // return { token };

      const token = jwt.sign(
      { id: student._id, email: student.email, role: student.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    return { message: 'Login successful', token };

  }

 
  async getProfile(id: string) {
    const student = await this.studentModel.findById(id).select('-password');
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }


  async findAll() {
    return this.studentModel.find().select('-password');
  }


  async findById(id: string) {
    const student = await this.studentModel.findById(id).select('-password');
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  // ✅ Delete student and image from cloudinary
  async delete(id: string) {
    const student = await this.studentModel.findById(id);
    if (!student) throw new NotFoundException('Student not found');

    if (student.cloudinaryId) {
      await cloudinary.uploader.destroy(student.cloudinaryId);
    }

    await student.deleteOne();
    return { message: 'Student deleted successfully' };
  }

  // ✅ Update profile picture
  async updateProfilePic(id: string, file: Express.Multer.File) {
    const student = await this.studentModel.findById(id);
    if (!student) throw new NotFoundException('Student not found');

    // Delete old image if exists
    if (student.cloudinaryId) {
      await cloudinary.uploader.destroy(student.cloudinaryId);
    }

  // student.profilePic = file.path;
  // student.cloudinaryId = (file as any).filename || '';

    await student.save();
    return { message: 'Profile picture updated', profilePic: student.profilePic };
  }

  async updateStudent(id: string, dto: Partial<CreateStudentDto>) {
  const student = await this.studentModel.findById(id);
  if (!student) throw new NotFoundException('Student not found');

  // If email is changing, check if it's already taken
  if (dto.email && dto.email !== student.email) {
    const emailTaken = await this.studentModel.findOne({ email: dto.email });
    if (emailTaken) throw new BadRequestException('Email already exists');
  }

  

  Object.assign(student, dto); // Apply the updates
  await student.save();

  return { message: 'Profile updated successfully', student };
}

async resetPassword(id: string, newPassword: string) {
  const student = await this.studentModel.findById(id);
  if (!student) throw new NotFoundException('Student not found');

  student.password = await bcrypt.hash(newPassword, 10);
  await student.save();

  return { message: 'Password reset successfully' };
}

async logout(req: Request, res: Response) {

    res.clearCookie('isAuthenticated');

    return res.status(200).json({ message: 'User successfully logged out' });
  }


  async findEmail(email: string): Promise<Student | null> {
  return this.studentModel.findOne({ where: { email } });
}
}
