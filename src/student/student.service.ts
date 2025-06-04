// src/student/student.service.ts

import { BadRequestException, Injectable, NotFoundException, Req, Res, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Student, StudentDocument } from './entities/student.entity';
import { Model } from 'mongoose';
import { CreateStudentDto } from './dto/create-student.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

import cloudinary from '../utils/cloudinary';
import { LoginStudentDto } from '../auth/dto/login-student.dto';

@Injectable()
export class StudentService {

    constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,

  ) {}

  async register(dto: CreateStudentDto, file?: Express.Multer.File) {
  const existing = await this.studentModel.findOne({ email: dto.email });
  if (existing) throw new BadRequestException('Email already exists');

  const hashed = await bcrypt.hash(dto.password, 10);
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

async createAdmin(data: {
  fullName: string;
  email: string;
  password: string;
  role: string;
}) {
  const existing = await this.studentModel.findOne({ email: data.email });
  if (existing) throw new BadRequestException('Admin already exists');

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const admin = new this.studentModel({
    ...data,
    password: hashedPassword,
  });

  await admin.save();
  return admin;
}

  async login(dto: LoginStudentDto, res: Response) {
  const student = await this.studentModel.findOne({ email: dto.email });
  if (!student) throw new UnauthorizedException('Invalid email');
  if (student.isBlocked) {
  throw new UnauthorizedException('Your account is blocked.');
}

  const isMatch = await bcrypt.compare(dto.password, student.password);
  if (!isMatch) throw new UnauthorizedException('Invalid password');

  const token = jwt.sign(
    { id: student._id, email: student.email, role: student.role },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  // Set token as cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  return res.status(200).json({
    message: 'Login successful',
    token,
    student: {
      id: student._id,
      fullName: student.fullName,
      email: student.email,
      role: student.role,
      profilePic: student.profilePic,
    
      
    },
  });

  
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

  // Make public_id unique by adding a timestamp or user ID
  const uniquePublicId = `${Date.now()}-${file.originalname.split('.')[0]}`;

  // Upload new image to Cloudinary
  const uploaded = await cloudinary.uploader.upload(file.path, {
    folder: 'school-api',
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
    public_id: uniquePublicId, // unique public_id
  });

  // Update student's profile picture and cloudinaryId
  student.profilePic = uploaded.secure_url;
  student.cloudinaryId = uploaded.public_id;

  await student.save();

  return {
    message: 'Profile picture updated',
    profilePic: student.profilePic,
    filename: file.originalname,
  };
}


  async updateStudent(id: string, dto: Partial<CreateStudentDto>) {
  const student = await this.studentModel.findById(id);
  if (!student) throw new NotFoundException('Student not found');

  // If email is changing, check if it's already taken
  if (dto.email && dto.email !== student.email) {
    const emailTaken = await this.studentModel.findOne({ email: dto.email });
    if (emailTaken) throw new BadRequestException('Email already exists');
  }


  if (dto.password) {
    dto.password = await bcrypt.hash(dto.password, 10);
  }

  

  Object.assign(student, dto);
  await student.save();

  return { message: 'Profile updated successfully', student: {
      id: student._id,
      fullName: student.fullName,
      email: student.email,
      role: student.role,
      profilePic: student.profilePic,
      cloudinaryId: student.cloudinaryId,
    } };
}

async resetPassword(id: string, newPassword: string) {
  const student = await this.studentModel.findById(id);
  if (!student) throw new NotFoundException('Student not found');

  student.password = await bcrypt.hash(newPassword, 10);
  await student.save();

  return { message: 'Password reset successfully' };
}

async logout(req: Request, res: Response) {
  res.clearCookie('jwt');
  return res.status(200).json({ message: 'User successfully logged out' });
}


async blockStudent(id: string) {
  const student = await this.studentModel.findById(id);
  if (!student) throw new NotFoundException('Student not found');
  student.isBlocked = true;
  await student.save();
  return { message: 'Student blocked' };
}

async unblockStudent(id: string) {
  const student = await this.studentModel.findById(id);
  if (!student) throw new NotFoundException('Student not found');

  student.isBlocked = false;
  await student.save();

  return { message: 'Student unblocked successfully' };
}

async findBlockedStudents() {
  return this.studentModel.find({ isBlocked: true }).select('-password');
}


  async findEmail(email: string): Promise<Student | null> {
  return this.studentModel.findOne({ where: { email } });
}

async promoteToAdmin(id: string) {
  const user = await this.studentModel.findById(id);
  if (!user) throw new NotFoundException('User not found');

  user.role = 'admin';
  await user.save();

  return { message: 'User promoted to admin', user: {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role
  }};
}
async depromoteToStudent(id: string) {
  const user = await this.studentModel.findById(id);
  if (!user) throw new NotFoundException('User not found');

  user.role = 'student'; // reset role to student
  await user.save();

  return {
    message: 'User depromoted to student',
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
}


}
