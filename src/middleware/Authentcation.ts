
import { getsegnature, TokenType, decodedTokenAndfitchUser } from './../utils/token';
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../utils/classErrorHandling";




export const authantcation = ( tokenType :TokenType = TokenType.access)=>
{
    return async (req :Request, res :Response, next :NextFunction) => {

    const { authorization } = req.headers;
    // console.log(req.headers);
    
    const [prefix, token  ] = authorization?.split(" ") || [];
    if (!prefix || !token) {
      throw new CustomError("Invalid authorization header format", 401);
    }
  // console.log(token);
  

    const segnature = await getsegnature(tokenType,prefix);
    // console.log(segnature);
    
    if (!segnature) {
      throw new CustomError("Invalid segnature not found", 401)    
     
    }

    

const decoded= await decodedTokenAndfitchUser(token,segnature)
if(!decoded){
    throw new CustomError("Invalid token decoded or user not found",401)
}
req.user=decoded?.user
req.decoded=decoded.decoded
 return next();
}

};
