import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodType } from "zod";
import { CustomError } from "../utils/classErrorHandling";


type ReqType = keyof Request;
type SchemaType = Partial<Record<ReqType, ZodType>>;

export const Validation = (schema: SchemaType): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: any[] = [];

    for (const key of Object.keys(schema) as ReqType[]) {
      if (!schema[key]) continue;

      if (req?.file)
      {
        req.body.attachments = req.file
      }
      if (req?.files)
      {
        req.body.attachments = req.files
      }

      const result = schema[key]!.safeParse(req[key]);
      if (!result.success) {
        validationErrors.push({ [key]: result.error.format() });
      }
    }

    if (validationErrors.length > 0) {
      return next(new CustomError(validationErrors, 400));
    }

    return next();
  };
};
