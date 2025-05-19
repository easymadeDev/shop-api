// src/student/dto/create-student.dto.ts

import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  @IsEnum(['student', 'admin'])
  role?: string;

  @IsOptional()
  profilePic?: string;

  @IsOptional()
  cloudinaryId?: string;
}
