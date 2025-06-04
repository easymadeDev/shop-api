// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { StudentService } from './student/student.service';
// import * as dotenv from 'dotenv';

// dotenv.config();

// async function bootstrap() {
//   const app = await NestFactory.createApplicationContext(AppModule);
//   const studentService = app.get(StudentService);

//   const email = 'admin@school.com';
//   const existingAdmin = await studentService.findEmail(email);
//   if (existingAdmin) {
//     console.log('Admin already exists.');
//   } else {
//     await studentService.createAdmin({
//       fullName: 'Super Admin',
//       email,
//       password: 'Admin123',
//       role: 'admin',
//     });
//     console.log('Admin created.');
//   }

//   await app.close();
// }

// bootstrap();
