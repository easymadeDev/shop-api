import { IsNotEmpty, IsEmail, IsStrongPassword } from "class-validator";

// src/auth/dto/login-student.dto.ts
export class LoginStudentDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
