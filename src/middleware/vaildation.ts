import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodType } from "zod";
import { CustomError } from "../utils/classErrorHandling";
import { GraphQLError } from "graphql";


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


export const ValidationGQL = async(schema: ZodType, args: any) => {
  const errorResult = [];

  const result = schema.safeParse(args);

  if (!result.success) {
    errorResult.push(result.error);

    if (errorResult.length) {
      throw new GraphQLError("Validation Error", {
        extensions: {
          code: "VALIDATION_ERROR",
          http: { status: 400 },
          errors: JSON.parse(errorResult as unknown as string),
        },
      });
    }
  }
};

