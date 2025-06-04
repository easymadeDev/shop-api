import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import * as dotenv from 'dotenv';
import { Request } from 'express';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    const originalName = file.originalname.replace(/\.[^/.]+$/, '');
    const extension = file.mimetype.split('/')[1]; 

    return {
      folder: 'school-api',
      public_id: originalName,
      format: extension,
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    };
  },
});

export default cloudinary;
