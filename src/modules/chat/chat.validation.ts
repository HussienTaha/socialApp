
import * as z from "zod";
import { generalRules } from "../../utils/generallRouls";
import { allowedTypes } from "../../middleware/multer.cloud";

export const chatSchema = {
  params: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format"),
  }),
};
export const chatGroupSchema = {
  params: z.object({
    groupId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format"),
  }),
};




export const createGroupChatSchema = {
  body: z.object({
    group: z
      .string( "Group name is required" )
      .min(3, "Group name must be at least 3 characters")
      .max(50, "Group name too long"),

    participants: z
      .array(generalRules.id)
      .nonempty("At least one participant is required"),
  }),

  file: z
    .object({
      mimetype: z
        .string()
        .refine(
          (val) => allowedTypes.includes(val),
          "Invalid file type. Allowed types are: images, videos, audios, or documents"
        ),
      size: z
        .number()
        .max(10 * 1024 * 1024, "File size must be under 10MB"),
    })
    .optional(),
};



export type createGroupChatSchemaType = z.infer<typeof createGroupChatSchema>;
export type chatSchemaType = z.infer<typeof chatSchema>;




