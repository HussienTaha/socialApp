import th from 'zod/v4/locales/th.js';
import RevokedTokenModel from '../DB/models/revokedtoken.model';
import userModel from '../DB/models/user.model';
import { RevokedTokenRepository } from '../DB/repositories/revokedToken.reposatories';
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
    refresh="refresh",
    super="super"
   
}

const  _userModel = new UserRepository(userModel);
const  _revokedModel = new RevokedTokenRepository(RevokedTokenModel);

export const getsegnature = async(tokenType:TokenType ,prefix:string) => {
     if(tokenType === TokenType.access){
       if(prefix===process.env.BEARER_USER){
           return process.env.USER_ACCESS_TOKEN_KEY
       }
       else if(prefix===process.env.SUPER_ADMIN){
           return process.env.SUPER_ACCESS_TOKEN_KEY
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
       else if(prefix===process.env.SUPER_ADMIN){
           return process.env.SUPER_REFRESH_TOKEN_KEY
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
    console.log(user);
    
    if(!user.confermed){
        throw new CustomError("User not confirmed or is deleted",401)
    }

    if (await _revokedModel.findOne({tokenId:decoded.jti})){ 
        throw new CustomError("Token is revoked",401)
    }
     if(user?.changecredentials?.getDate()!>decoded?.iat!*1000){
throw new CustomError("User change credentials and token is expired or is revoked",401)  

    }

      return {user,decoded}
}