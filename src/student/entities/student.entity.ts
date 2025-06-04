import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional, IsStrongPassword } from 'class-validator';
import { Document } from 'mongoose';

export type StudentDocument = Student & Document;

@Schema()
export class Student {

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })

  password: string;


  @Prop({ default: 'student', enum: ['student', 'admin', 'super admin',] })
  role?: string;

  @Prop({ default: false })
  isBlocked: boolean;


  @Prop({ default: 'active', enum: ['active', 'blocked'] })
  status: string;


  @Prop()
  profilePic?: string;


 
  @Prop()
  cloudinaryId?: string;
  id: any;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
