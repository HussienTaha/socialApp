import  { Request}  from 'express';
import  multer, { FileFilterCallback }  from "multer";
import { CustomError } from '../utils/classErrorHandling';
import { FILE_TYPES } from '../utils/fileTypes';
import { file } from 'zod';
import os from 'os'



// هنجمع كل الأنواع المسموحة من الـ FILE_TYPES
export const allowedTypes = [
  ...Object?.values(FILE_TYPES.IMAGES),
  ...Object?.values(FILE_TYPES.VIDEOS),
  ...Object?.values(FILE_TYPES.AUDIOS),
  ...Object?.values(FILE_TYPES.DOCUMENTS),
];
export enum allowedTypesEnum {
Local="local",
Cloud="cloud"
}

 export const multerCloud= (

    {fileTypes = allowedTypes,
      storeType=allowedTypesEnum.Cloud
    }:{
        fileTypes?:string[]
        storeType?:allowedTypesEnum

    }
    
 )=>{
    const storage = storeType===allowedTypesEnum.Cloud?multer.memoryStorage(): multer.diskStorage({
      destination: os.tmpdir(),
      filename: function (req: Request, file: Express.Multer.File, cb) {
        cb(null, Date.now() + file.originalname);
      },
    });

    const fileFilter = (req: Request, file: Express.Multer.File, cb:FileFilterCallback) => {
      if (fileTypes?.includes(file.mimetype)) {
        cb(null, true);
      } else {
        return cb(new CustomError("Invalid file type", 400));
      }
    }
    const upload = multer({ storage , limits: { fileSize: 1024 * 1024 * 5 },fileFilter});
    return upload


  }