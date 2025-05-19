// src/student/student.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { Student, StudentSchema } from './entities/student.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [MongooseModule.forFeature([{ name: Student.name, schema: StudentSchema }]),
 JwtModule.register({
  global: true,
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
}),
  
],
  controllers: [StudentController],
  providers: [StudentService],
})

export class StudentModule {}
