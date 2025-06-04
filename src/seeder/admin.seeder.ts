import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { StudentModel } from '../student/student.model';

dotenv.config();

async function seedAdmins() {
  await mongoose.connect(process.env.MONGODB_URI || '');

  const superadmins = [
    {
      fullName: 'Super Admin One',
      email: 'super1@student.com',
      password: 'super123',
      role: 'super admin',
    },
    {
      fullName: 'Super Admin Two',
      email: 'super2@student.com',
      password: 'super123',
      role: 'super admin',
    }
  ];

  for (const admin of superadmins) {
    const existing = await StudentModel.findOne({ email: admin.email });
    if (existing) {
      console.log(`Admin ${admin.email} already exists`);
      continue;
    }

    const hashed = await bcrypt.hash(admin.password, 10);
    await StudentModel.create({
      ...admin,
      password: hashed,
      profilePic: '',
      cloudinaryId: '',
    });

    console.log(`✅ Admin ${admin.email} created`);
  }

  await mongoose.disconnect();
  process.exit();
}

seedAdmins();
