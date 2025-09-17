import mongoose, { Types }from "mongoose"
import { string } from "zod"

export enum GenderType {
    male = "male",
    female = "female"
}
export enum RoleType {
    user = "user",
    admin = "admin"
}
export interface IUser {
    _id:Types.ObjectId,
    fName: string ,
    lName: string ,
    userName?:string, 
    age?: number, 
    otp?:string,
    email: string, 
    password: string, 
    gender: string, 
    confermed: boolean,
    address?: string, 
    changecredentials?:Date,
    role?: string, 
    phone?: string, 
    createdAt:Date,
    updatedAt:Date

}
const userSchema = new  mongoose.Schema<IUser>({
    fName:{type: String, required: true ,minlength:3 ,mixlength:20 },
    lName:{ type:String  ,  required: true,minlength:3 ,mixlength:20 },
  age:{ type: Number, required: true ,min:18,max:100 },
    email:{ type: String, required: true , unique: true },
    otp :{ type: String},
    changecredentials:Date,
    confermed:{ type: Boolean, default: false },
    password:{ type: String, required: true },
    gender:{ type: String, enum: GenderType , default : GenderType.male, required: true },
    address:{ type: String, required: true },
    role:{ type: String, enum: RoleType , default: RoleType.user,required: true },
    phone:{ type: String, required: true },
    createdAt:Date,
    updatedAt:Date
     



},{
    timestamps:true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
})

userSchema.virtual("userName").set(function (value) {
const [fName,lName] = value.split(" ")

this.set({
    fName,
    lName
}) 
}).get(function () {
    return `${this.fName}   ${this.lName}`
})

const userModel= mongoose.models.User || mongoose.model<IUser>("User",userSchema)
export default userModel