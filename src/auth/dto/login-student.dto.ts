import { IsNotEmpty, IsEmail, IsStrongPassword } from "class-validator";


export class LoginStudentDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
