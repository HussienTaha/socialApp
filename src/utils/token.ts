import userModel from '../DB/models/user.model';
import { UserRepository } from './../DB/repositories/user.reposatories';
import { CustomError } from './classErrorHandling';
import jwt, { JwtPayload }  from 'jsonwebtoken'
export const generateToken =async ({payload,segnature ,option    }:{
    payload:object,
    segnature:string,
    option?:jwt.SignOptions
}) :Promise<string> =>{
    return jwt.sign(payload,segnature,option)
}
export const verifyToken =async ({token,segnature}:{
    token:string,
    segnature:string
}):Promise<JwtPayload> =>{
    return jwt.verify(token,segnature) as JwtPayload
}
export enum TokenType{
    access="access",
    refresh="refresh"
}

const  _userModel = new UserRepository(userModel);

export const getsegnature = async(tokenType:TokenType ,prefix:string) => {
     if(tokenType === TokenType.access){
       if(prefix===process.env.BEARER_USER){
           return process.env.USER_ACCESS_TOKEN_KEY
       }
       else if(prefix===process.env.BEARER_ADMIN){
           return process.env.ADMIN_ACCESS_TOKEN_KEY
       }
       else{null}
     }



      if(tokenType === TokenType.refresh){
       if(prefix===process.env.BEARER_USER){
           return process.env.USER_REFRESH_TOKEN_KEY
       }
       else if(prefix===process.env.BEARER_ADMIN){
           return process.env.ADMIN_REFRESH_TOKEN_KEY
       }
       else{null}
    }
 return null
};



export const decodedTokenAndfitchUser=async(token:string,segnature:string) => {


    //  هنا عاوز يضري err عشان بعمل decoded.email  ف هنا عملت اسه بص  decoded as JwtPayload
    //  طلع الغلط يا معلم ان انا مش  عالم await علي ال verig
    const decoded= await verifyToken({token,segnature}) ; 
    if(!decoded){
        throw new CustomError("Invalid token",401)
    }

    const user= await _userModel.findOne({email:decoded.email})
    if(!user){
        throw new CustomError("User not found",404)
    }
    if(!user.confermed){
        throw new CustomError("User not confirmed or is deleted",401)
    }
    return {user,decoded}


}