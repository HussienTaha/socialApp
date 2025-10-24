import { createReadStream } from "fs";
import { v4 as uuidv4 } from "uuid";
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { allowedTypesEnum } from "../middleware/multer.cloud";
import { CustomError } from "./classErrorHandling";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
export const s3Client = () => {
  return new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
};

export const uploadFile = async ({
  storeType = allowedTypesEnum.Cloud,
  Bucket = process.env.AWS_BUCKET_NAME!,
  Path = "general",
  ACL = "private" as ObjectCannedACL,
  file,
}: {
  storeType?: allowedTypesEnum;
  Bucket?: string;
  Path: string;
  ACL?: ObjectCannedACL;
  file: Express.Multer.File;
}): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket,
    Key: `${process.env.AWS_FOLDER}/${Path}/${uuidv4()}_${file.originalname}`,
    Body:
      storeType === allowedTypesEnum.Cloud
        ? file.buffer
        : createReadStream(file.path),
    ContentType: file.mimetype,
    ACL,
  });

  await s3Client().send(command);

  await s3Client().send(command);
  if (!command.input?.Key) throw new CustomError("key not found", 404);

  return command.input?.Key!;
};

export const uplodeLageFile = async ({
  storeType = allowedTypesEnum.Cloud,
  Bucket = process.env.AWS_BUCKET_NAME!,
  Path = "general",
  ACL = "private" as ObjectCannedACL,
  file,
}: {
  storeType?: allowedTypesEnum;
  Bucket?: string;
  Path: string;
  ACL?: ObjectCannedACL;
  file: Express.Multer.File;
}): Promise<string> => {
  const uplode = new Upload({
    client: s3Client(),
    params: {
      Bucket,
      Key: `${process.env.AWS_FOLDER}/${Path}/${uuidv4()}_${file.originalname}`,
      Body:
        storeType === allowedTypesEnum.Cloud
          ? file.buffer
          : createReadStream(file.path),
      ContentType: file.mimetype,
      ACL,
    },
  });
  uplode.on("httpUploadProgress", (progress) => {
    console.log(
      `Uploaded ${progress.loaded} bytes of ${progress.total} bytes.`
    );
  });

  const { Key } = await uplode.done();
  if (!Key) throw new CustomError("key not found", 404);

  return Key;
};

export const uploadFiles = async ({
  storeType = allowedTypesEnum.Cloud,
  Bucket = process.env.AWS_BUCKET_NAME!,
  path = "general",
  ACL = "private" as ObjectCannedACL,
  files,
}: {
  storeType?: allowedTypesEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path: string;
  files: Express.Multer.File[];
}) => {
  let urls: string[] = [];
  if (!files || !Array.isArray(files)) {
    throw new Error("Files must be an array");
  }
  urls = await Promise.all(
    files.map((file) =>
      uploadFile({ storeType, Bucket, Path: path, ACL, file })
    )
  );

  return urls;
};

// export const creartUplodeFilePresignedUrl = async ({
//   Bucket = process.env.AWS_BUCKET_NAME!,
//   Path = "general",
//   orgnalName,
//   contentType,
// }: {
//   Bucket?: string;
//   Path?: string;
//   orgnalName: string;
//   contentType: string;
// }) => {
//   const command = new PutObjectCommand({
//     Bucket,
//     Key: `${process.env.AWS_FOLDER}/${Path}/${uuidv4()}_${orgnalName}`,
//     ContentType: contentType,
//   });

//   const url = await getSignedUrl(s3Client(), command, { expiresIn: 3600 });
//   return { url , Key:command.input?.Key!};
// }
//! git file


export const creartUplodeFilePresignedUrl = async ({
  Bucket = process.env.AWS_BUCKET_NAME!,
  Path = "general",
  orgnalName,
  contentType,
  expiresIn=3600
}: {
  Bucket?: string;
  Path?: string;
  orgnalName: string;
  contentType: string;
  expiresIn?: number
}) => {
  const Key = `${process.env.AWS_FOLDER}/${Path}/${uuidv4()}_${orgnalName}`;

  const command = new PutObjectCommand({
    Bucket,
    Key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client(), command, { expiresIn });

  return { key: Key, url }; // ✅ رجّع الاتنين معًا
};



export const gitFile = async ({
  Bucket = process.env.AWS_BUCKET_NAME!,
  Key,
}: {
  Bucket?: string;
  Key: string;
}) => {
  const command = new GetObjectCommand({
    Bucket,
    Key,
  });
  return await s3Client().send(command);
};

export const creartUplodeFilePresigneUrl = async ({
  Bucket = process.env.AWS_BUCKET_NAME!,

  Key,
}: {
  Bucket?: string;
  Key: string;
}) => {
  const command = new PutObjectCommand({
    Bucket,
    Key,
  });
  console.log(Bucket, Key);

  const url = await getSignedUrl(s3Client(), command, { expiresIn: 3600 });
  return url;
};

export const deleteFile = async ({
  Bucket = process.env.AWS_BUCKET_NAME!,
  Key,
}: {
  Bucket?: string;
  Key: string;
}) => {
  const command = new DeleteObjectCommand({
    Bucket,
    Key,
  });
  await s3Client().send(command);
};

export const deletefiles = async ({
  Bucket = process.env.AWS_BUCKET_NAME!,
  urls,
  Quite = false,
}: {
  Bucket?: string;
  urls: string[];
  Quite?: boolean;
}) => {
  const command = new DeleteObjectsCommand({
    Bucket,
    Delete: {
      Objects: urls.map((url) => ({ Key: url })),
      Quiet: Quite,
    },
  });
  await s3Client().send(command);
};
//! get all files
export const getAllFiles = async ({
  Bucket = process.env.AWS_BUCKET_NAME!,
  path
}: {
  Bucket?: string;
  path: string
}) => {
  const command = new ListObjectsV2Command({
    Bucket,
    Prefix: `${process.env.AWS_FOLDER}/${path}`,
  });
  const result = await s3Client().send(command);
  
  return result;
};