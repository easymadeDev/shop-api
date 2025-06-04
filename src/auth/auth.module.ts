// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { Student, StudentSchema } from '../student/entities/student.entity';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt-auth/jwt.strategy';
import { StudentModule } from 'src/student/student.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Student.name, schema: StudentSchema }]),
    PassportModule,  StudentModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super_secret_key_128',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
