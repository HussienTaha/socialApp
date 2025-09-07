
 import z from "zod";

  const signUpSchema ={body: z.strictObject({
    userName: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),

    cpassword: z.string(),
    gender: z.string().min(3).max(20).optional(),
    address: z.string().min(3).max(20).optional(),
    role: z.string().min(3).max(20).optional(),
    phone: z.string().min(3).max(20).optional(),
    age: z.number().min(18).max(100).optional(),
    lName: z.string().min(3).max(20),
    fName: z.string().min(3).max(20),
 }).required().superRefine((data, ctx) => {
    if(data.password !== data.cpassword){
        ctx.addIssue({
            code: "custom",
            message: "Passwords do not match",
        })
    }
 })
}
export type signUpschemaType = z.infer<typeof signUpSchema.body>;