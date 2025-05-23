// src/auth/auth.service.ts

import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from '../student/entities/student.entity';
import { RegisterStudentDto } from './dto/register-student.dto';
import { LoginStudentDto } from './dto/login-student.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterStudentDto) {
    const exists = await this.studentModel.findOne({ email: dto.email });
    if (exists) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const student = new this.studentModel({
      fullName: dto.fullName,
      email: dto.email,
      password: hashedPassword,
    });
    await student.save();
    return { message: 'Registration successful' };
  }

  async login(dto: LoginStudentDto) {
  const student = await this.studentModel.findOne({ email: dto.email });

  if (!student) {
    throw new UnauthorizedException('Invalid Email');
  }

  const isPasswordVaild = await bcrypt.compare(dto.password, student.password);
  if (!isPasswordVaild) {
    throw new UnauthorizedException('Invalid password');
  }

  const payload = { sub: student.id, email: student.email };
  const token = this.jwtService.sign(payload);

  return {
    message: 'Login successful',
    token,
    student: {
      id: student.id,
      name: student.fullName,
      email: student.email,
    },
  };

  
}

}
