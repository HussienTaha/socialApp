import * as z from "zod";
import { AllowCommentEnum, AvailabilityEnum } from "../../DB/models/post.model";
import ta from "zod/v4/locales/ta.js";
import mongoose, { Query } from "mongoose";
import { generalRules } from "../../utils/generallRouls";
export enum actionEnum {
    like = "like",
    unlike = "unlike"
}
export const createPostSchema = {
    body: z.strictObject({
       content:z.string().min(3).max(2000).optional(),
      attachments: z.array(
  z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    buffer: z.instanceof(Buffer).optional(),
    path: z.string().optional(),
    size: z.number(),
  })
).optional(),
       assetFolderId:z.string().optional(),
       allowComment:z.enum(AllowCommentEnum).default(AllowCommentEnum.ALLOW).optional(),
       availability:z.enum(AvailabilityEnum).default(AvailabilityEnum.PUBLIC).optional(),
       tags:z.array(generalRules.id).refine((value) => {
        return new Set(value).size === value?.length
       },{ message: "tags  is duplicate"}).optional(),

    }).superRefine((data, ctx) => {
        if (!data?.content && !data.attachments?.length) {
          ctx.addIssue({
            code: "custom",
            path:["content"],
            message: "content is empty please enter content",
          });
        }
      })
};


export const updatePostSchema = {
    body: z.strictObject({
       content:z.string().min(3).max(2000).optional(),
      attachments: z.array(
  z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    buffer: z.instanceof(Buffer).optional(),
    path: z.string().optional(),
    size: z.number(),
  })
).optional(),
       assetFolderId:z.string().optional(),
       allowComment:z.enum(AllowCommentEnum).default(AllowCommentEnum.ALLOW).optional(),
       availability:z.enum(AvailabilityEnum).default(AvailabilityEnum.PUBLIC).optional(),
       tags:z.array(generalRules.id).refine((value) => {
        return new Set(value).size === value?.length
       },{ message: "tags  is duplicate"}).optional(),

    }).superRefine((data, ctx) => {
        if (!Object?.values(data).length) {
          ctx.addIssue({
            code: "custom",
         
            message: "at least one field is required",
          });
        }
      })
};
export const  liksPostSchema = {
    params: z.strictObject({
       postId:generalRules.id,
    }), query: z.strictObject({
        action:z.enum(actionEnum).default(actionEnum.like)
    })};

export type createPostInput = z.infer<typeof createPostSchema["body"]>;
export type liksPostInput = z.infer<typeof liksPostSchema.params>;
export type liksPostQuery = z.infer<typeof liksPostSchema.query>;