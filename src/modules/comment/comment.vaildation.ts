import * as z from "zod";
import { generalRules } from "../../utils/generallRouls";

export const createCommentSchema = {
    params:z.strictObject({
        postId:generalRules.id
    }),
  body: z
    .strictObject({
      content: z.string().min(3).max(2000).optional(),
      attachments: z
        .array(
          z.object({
            fieldname: z.string(),
            originalname: z.string(),
            encoding: z.string(),
            mimetype: z.string(),
            buffer: z.instanceof(Buffer).optional(),
            path: z.string().optional(),
            size: z.number(),
          })
        )
        .optional(),
      assetFolderId: z.string().optional(),

      tags: z
        .array(generalRules.id)
        .refine(
          (value) => {
            return new Set(value).size === value?.length;
          },
          { message: "tags  is duplicate" }
        )
        .optional(),
    })
    .superRefine((data, ctx) => {
      if (!data?.content && !data.attachments?.length) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "content is empty please enter content",
        });
      }
    }),
};
 export const updateCommentSchema = {
  params:z.strictObject({
    commentId:generalRules.id
  }),  body: z
    .strictObject({
      content: z.string().min(3).max(2000).optional(),
      attachments: z
        .array(
          z.object({
            fieldname: z.string(),
            originalname: z.string(),
            encoding: z.string(),
            mimetype: z.string(),
            buffer: z.instanceof(Buffer).optional(),
            path: z.string().optional(),
            size: z.number(),
          })
        )
        .optional(),
      assetFolderId: z.string().optional(),

      tags: z
        .array(generalRules.id)
        .refine(
          (value) => {
            return new Set(value).size === value?.length;
          },
          { message: "tags  is duplicate" }
        )
        .optional(),
    })
    .superRefine((data, ctx) => {
      if (!data?.content && !data.attachments?.length) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "content is empty please enter content",
        });
      }
    }),
  
}
export const deleteCommentSchema = {
  params:z.strictObject({
    commentId:generalRules.id
  })
}