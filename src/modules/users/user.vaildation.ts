
import z from "zod";
export  enum flagType{
  all = "all",
  current = "current"
  
}
export const signUpSchema = {
  body: z
    .strictObject({
      userName: z.string().min(3).max(20).optional(),
      email: z.string().email(),
      password: z
        .string()
        .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
      cpassword: z.string(),
      gender: z.string().min(3).max(20).optional(),
      address: z.string().min(3).max(20).optional(),
      role: z.string().min(3).max(20).optional(),
      phone: z.string().min(3).max(20).optional(),
      age: z.number().min(18).max(100).optional(),
      lName: z.string().min(3).max(20),
      fName: z.string().min(3).max(20),
    })
    .required()
    .superRefine((data, ctx) => {
      if (data.password !== data.cpassword) {
        ctx.addIssue({
          code: "custom",
          message: "Passwords do not match",
        });
      }
    }),
};
export const confermedotpSchema = {
  body: z.strictObject({
    email: z.string().email(),
    otp: z.string().regex(/^[0-9]{6}$/),
  }),
};
export const loginSchema = {
  body: z.strictObject({
    email: z.string().email(),
    password: z
      .string()
      .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
  }),

  
}

export const logoutSchema = {
  body: z.strictObject({
    flag: z.enum(flagType),
  }).required(),
}
export type loginSchemaType = z.infer<typeof loginSchema.body>;
export type confermedotpSchemaType = z.infer<typeof confermedotpSchema.body>;
export type signUpschemaType = z.infer<typeof signUpSchema.body>;
export type logoutSchemaType = z.infer<typeof logoutSchema.body>; 
