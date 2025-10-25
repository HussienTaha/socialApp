import mongoose from "mongoose";
import { z } from "zod";

export const generalRules = {
  // ✅ Validate MongoDB ObjectId
  id: z.string().refine(
    (value) => mongoose.Types.ObjectId.isValid(value),
    { message: "Invalid user id" }
  ),

  // ✅ Validate Email
  email: z.string().email({ message: "Invalid email address" }),

  // ✅ Validate Strong Password
  // الشرط: على الأقل 8 حروف + حرف كابيتال + حرف سمول + رقم + رمز اختياري
  password: z.string().regex(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
    {
      message:
        "Password must contain at least 8 characters, including uppercase, lowercase, and a number",
    }
  ),

  // ✅ Validate OTP (6 digits only)
  otp: z.string().regex(/^[0-9]{6}$/, {
    message: "OTP must be exactly 6 digits",
  }),

  // ✅ Validate Uploaded File Object (e.g. from multer)
  file: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    buffer: z.instanceof(Buffer).optional(),
    path: z.string().optional(),
    size: z.number(),
  }),
};
