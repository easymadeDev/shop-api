import { Schema, model } from 'mongoose';

const StudentSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin', 'super admin'], default: 'student' },
  
},

);

export const StudentModel = model('Student', StudentSchema);
