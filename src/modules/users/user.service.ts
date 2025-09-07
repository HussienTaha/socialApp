import { UserRepository } from './../../DB/repositories/user.reposatories';
import { HydratedDocument, Model } from 'mongoose';
import { signUpschemaType } from './user.vaildation';
import { NextFunction, Request, Response } from "express";
import userModel, { IUser } from '../../DB/models/user.model';
import { DBrepositories } from '../../DB/repositories/DB.repositories';
import { Hash } from '../../utils/hash';
import { generateOtp, sendEmail } from '../../service/sendEmail';
import { emailTemplet } from '../../service/emailTemplet';
import { eventEmitter } from '../../utils/events';
;

 
class UserService {


    // private _userModel:Model<IUser>=userModel
    //  private _userModel= new DBrepositories<IUser>(userModel)
    private _userModel = new UserRepository(userModel)

    constructor() {
        
    }
    signup = async(req: Request, res: Response, next: NextFunction)=> {
     
            let { userName, email, password,lName,fName,cpassword, gender, address, role, phone, age }:signUpschemaType = req.body

     


            if (await this._userModel.findOne({ email })) {
                throw new Error("Email already exists");
            }
      
            const hash =await Hash(password)
          const user =  await this._userModel.createOneUser({
                userName,
                email,
                password:hash,
                gender,
                address,
                role,
                phone,
                age,
                lName,
                fName
            })

            eventEmitter.emit("confermemail",{
                email
                
            })
           
            res.status(201).json({ message: "User signed up successfully 👌👌",user });
       
            
        
    }

    // login service
    async login(req: Request, res: Response, next: NextFunction) {
      
            // Your login logic here
            res.status(200).json({ message: "User logged in successfully" });
        
            
        
    }
}

export default new UserService();