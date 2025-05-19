// src/student/student.service.ts

import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Student, StudentDocument } from './entities/student.entity';
import { Model } from 'mongoose';
import { CreateStudentDto } from './dto/create-student.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import cloudinary from 'src/utils/cloudinary';
import { LoginStudentDto } from 'src/auth/dto/login-student.dto';

@Injectable()
export class StudentService {
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

  const student = await this.studentModel.create({
    ...dto,
    password: hashed,
    // profilePic?: imageUrl,
    role: dto.role || 'student',
  });

  return { message: 'Registered successfully' };
}
  async login(dto: LoginStudentDto) {
    const student = await this.studentModel.findOne({ email: dto.email });
    if (!student) throw new UnauthorizedException('Invalid credentials');

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

  // ✅ Get Auth Profile
  async getProfile(id: string) {
    const student = await this.studentModel.findById(id).select('-password');
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  // ✅ Get All
  async findAll() {
    return this.studentModel.find().select('-password');
  }

  // ✅ Get by ID
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

    const uploaded = await cloudinary.uploader.upload(file.path);

    student.profilePic = uploaded.secure_url;
    student.cloudinaryId = uploaded.public_id;

    await student.save();
    return { message: 'Profile picture updated', profilePic: student.profilePic };
  }
}
