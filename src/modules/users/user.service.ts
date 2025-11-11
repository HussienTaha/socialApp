
import { UserRepository } from "./../../DB/repositories/user.reposatories";
import { HydratedDocument, Model, Types } from "mongoose";
import {
  confermedotpSchemaType,
  flagType,
  forgetPasswordSchemaType,
  freezeSchemaType,
  getGraphQlSchema,
  logoutSchemaType,
  reasetPasswordSchemaType,
  signUpschemaType,
} from "./user.vaildation";
import { NextFunction, Request, response, Response } from "express";
import userModel, { IUser, RoleType } from "../../DB/models/user.model";
import { DBrepositories } from "../../DB/repositories/DB.repositories";
import { Compare, Hash } from "../../utils/hash";
import { generateOtp, sendEmail } from "../../service/sendEmail";
import { emailTemplet } from "../../service/emailTemplet";
import { eventEmitter } from "../../utils/events";
import { v4 as uuidv4 } from "uuid";
import { compare } from "bcrypt";
import { CustomError } from "../../utils/classErrorHandling";
import { generateToken } from "../../utils/token";
import { RevokedTokenRepository } from "../../DB/repositories/revokedToken.reposatories";
import RevokedTokenModel from "../../DB/models/revokedtoken.model";
import { exists } from "fs";
import {
  creartUplodeFilePresignedUrl,
  uploadFile,
  uploadFiles,
  uplodeLageFile,
} from "../../utils/s3config";
import ur from "zod/v4/locales/ur.js";
import { postRepository } from "../../DB/repositories/post.reposatories ";
import PostModel from "../../DB/models/post.model";
import FrindRquestModel from "../../DB/models/frindRequst.model";
import { frindRequesrRepository } from "../../DB/repositories/frindRequest.reposatories";
import { chatRepository } from "../../DB/repositories/chat.reposatories";
import { ChatModel } from "../../DB/models/chat.model";
import { GraphQLError } from "graphql";
import { authantcationGraph } from "../../middleware/Authentcation";
import { AuthorizationGQL } from "../../middleware/Authriztation";
import { ValidationGQL } from "../../middleware/vaildation";



class UserService {
  // private _userModel:Model<IUser>=userModel
  //  private _userModel= new DBrepositories<IUser>(userModel)
  private _userModel = new UserRepository(userModel);
  private _revokedModel = new RevokedTokenRepository(RevokedTokenModel);
    private _postModel = new postRepository(PostModel);
    private _FrindRquestModel = new frindRequesrRepository(FrindRquestModel);
      private _chatModel = new chatRepository(ChatModel);
    
  
  constructor() {}
  signup = async (req: Request, res: Response, next: NextFunction) => {
    let {
      userName,
      email,
      password,
      lName,
      fName,
      gender,
      address,
      role,
      phone,
      age,
    }: signUpschemaType = req.body;

    if (await this._userModel.findOne({ email })) {
      throw new CustomError("Email already exists", 404);
    }
    const otp = await generateOtp();
    const hashotp = await Hash(String(otp));
    const hash = await Hash(password);
    const user = await this._userModel.createOneUser({
      userName,
      email,
      password: hash,
      gender,
      address,
      role,
      otp: hashotp,
      phone,
      age,
      lName,
      fName,
    });

    eventEmitter.emit("confermemail", {
      email,
      otp,
    });

    return res
      .status(201)
      .json({ message: "User signed up successfully 👌👌", user });
  };

  confermotp = async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp }: confermedotpSchemaType = req.body;
    const user = await this._userModel.findOne({
      email,
      confermed: { $ne: true },
    });
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    if (!user.otp) {
      throw new CustomError("Otp not found", 404);
    }
    const comper = await Compare(otp, user.otp!);
    if (!comper) {
      throw new Error("Invalid otp or expired otp");
    }
    await this._userModel.updateone(
      { email },
      { $set: { confermed: true }, $unset: { otp: "" } }
    );

    return res.status(200).json({ message: "User confermed otp successfully" });
  };
  // login service
  login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password }: signUpschemaType = req.body;

    const user = await this._userModel.findOne({ email, confermed: true });

    if (!user) {
      throw new CustomError("User not found or not confermed yet", 404);
    }

    const comper = await Compare(password, user.password!);
    if (!comper) {
      throw new CustomError("Invalid password", 404);
    }
    const jwtid = uuidv4();

    const accessToken = await generateToken({
      payload: { id: user._id, email, role: user?.role as RoleType },
      segnature:
  user?.role === RoleType.user
    ? process.env.USER_ACCESS_TOKEN_KEY!
    : user?.role === RoleType.admin
    ? process.env.ADMIN_ACCESS_TOKEN_KEY!
    : process.env.SUPER_ACCESS_TOKEN_KEY!,

      option: { expiresIn: "1h", jwtid },
    });
   
    

    const refreshToken = await generateToken({
      payload: { id: user._id, email, role: user.role as RoleType },
      segnature:
        user?.role == RoleType.user
          ? process.env.USER_REFRESH_TOKEN_KEY!
          : process.env.ADMIN_REFRESH_TOKEN_KEY!,
      option: { expiresIn: "30d", jwtid },
    });
   
    res.status(200).json({
      message: "success",
      accessToken,
      refreshToken,
    });
  };
  //  greate get user service
  gitprofile = async (req: Request, res: Response, next: NextFunction) => {
    const userid = await this._userModel.findOne({ _id: req.user?._id },undefined,{ populate:[{path:"friends"}]});


    const groups = await this._chatModel.find({ participants: { $all: [req.user?._id] }, group: { $exists: true } });

    return res
      .status(200)
      .json({ message: "profile get successfully", user: req.user ,frinds:userid?.friends,groups});
  };
  logout = async (req: Request, res: Response, next: NextFunction) => {
    const { flag }: logoutSchemaType = req.body;

    if (flag === flagType?.all) {
      await this._revokedModel.updateone(
        { user: req.user?._id },
        { changecredentials: new Date() }
      );
      return res.status(200).json({ message: "User logged out successfully" });
    }
    await this._revokedModel.create({
      tokenId: req?.decoded.jti!,
      userId: req.user?._id!,
      expireAt: new Date(req?.decoded.exp! * 1000),
    });

    return res
      .status(200)
      .json({ message: "User logged out successfully  on this device" });
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const jwtid = uuidv4();

    const accessToken = await generateToken({
      payload: {
        id: req?.user?._id,
        email: req.user?.email,
        role: req.user?.role as RoleType,
      },
      segnature:
        req?.user?.role == RoleType.user
          ? process.env.USER_ACCESS_TOKEN_KEY!
          : process.env.ADMIN_ACCESS_TOKEN_KEY!,
      option: { expiresIn: "1h", jwtid },
    });

    const refreshToken = await generateToken({
      payload: {
        id: req?.user?._id,
        email: req.user?.email,
        role: req?.user?.role as RoleType,
      },
      segnature:
        req?.user?.role == RoleType.user
          ? process.env.USER_REFRESH_TOKEN_KEY!
          : process.env.ADMIN_REFRESH_TOKEN_KEY!,
      option: { expiresIn: "30d", jwtid },
    });
    const accessTokenAndRefreshToken = {
      accessToken,
      refreshToken,
    };
    await this._revokedModel.create({
      tokenId: req?.decoded.jti!,
      userId: req.user?._id!,
      expireAt: new Date(req?.decoded.exp! * 1000),
    });

    return res.status(200).json({
      message: " success to created a new refresh token",
      accessTokenAndRefreshToken,
    });
  };

  forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email }: forgetPasswordSchemaType = req.body;

    const user = await this._userModel.findOne({
      email,
      confermed: { $exists: true },
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }
    const otp = await generateOtp();
    const hashotp = await Hash(String(otp));
    await this._userModel.updateone({ email }, { otp: hashotp });
    eventEmitter.emit("forgetpassword", { email, otp });
    return res.status(200).json({ message: "success to send email" });
  };
  resetpassword = async (req: Request, res: Response, next: NextFunction) => {
    const { password, email, otp }: reasetPasswordSchemaType = req.body;

    const user = await this._userModel.findOne({
      email,
      otp: { $exists: true },
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    if (!(await compare(otp, user.otp!))) {
      throw new CustomError("Otp not valid", 401);
    }
    const hashpassword = await Hash(password);
    await this._userModel.updateone(
      { email },
      { password: hashpassword, $unset: { otp: "" } }
    );
    return res.status(200).json({ message: "success to reset password" });
  };

  //! uplode image in aws ???
  uplodeImage = async (req: Request, res: Response, next: NextFunction) => {
    const key = await uploadFile({
      Path: `users${req.user?._id}`,

      file: req.file!,
    });

    return res
      .status(200)
      .json({ message: "success to uplod image", key: key });
  };
  uplodeLargeImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const key = await uplodeLageFile({
      Path: `users${req.user?._id}`,

      file: req.file!,
    });

    return res
      .status(200)
      .json({ message: "success to uplod image", key: key });
  };
  uploadFiles = async (req: Request, res: Response, next: NextFunction) => {
    const key = await uploadFiles({
      path: `users${req.user?._id}`,
      files: req.files as Express.Multer.File[],
    });

    return res
      .status(200)
      .json({ message: "success to uplod image", key: key });
  };
  uplodeFileswithpresignedurl = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { contentType, orgnalName } = req.body;
    const url = await creartUplodeFilePresignedUrl({
      orgnalName,
      contentType,
      Path: `users/${req.user?._id}`,
    });

    return res
      .status(200)
      .json({ message: "success to uplod image", url: url });
  };

  uplodeProfileImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { contentType, orgnalName } = req.body;

    const { key, url } = await creartUplodeFilePresignedUrl({
      Path: `users/${req.user?._id}/coverImage`,
      contentType,
      orgnalName,
    });

    const user = await this._userModel.findOneAndupdate(
      { _id: req.user?._id },
      { profileImage: key, tempProfileImage: req.user?.profileImage }
    );

    if (!user) {
      throw new CustomError("User not found", 404);
    }
    eventEmitter.emit("uplodeProfileImage", {
      userId: req.user?._id,
      oldkey: req.user?.profileImage,
      key,
      expiresIn: 60,
    });
    return res
      .status(200)
      .json({ message: "success to uplod image", key: key ,url:url });
  };

  frezeUser = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } : freezeSchemaType = req.params  as unknown as freezeSchemaType;
    if (!userId && req.user?.role !== RoleType.admin) {
      throw new CustomError("User not found or not admin && unauthorized", 404);
    }
    const user = await this._userModel.findOneAndupdate(
      { _id: userId || req.user?._id,deletedAt:{ $exists: false } },
      {
        deletedAt: new Date(),
        deletedBy: req.user?._id,
        changecredentials: new Date(),
  
      }
    );
    if (!user) {
      throw new CustomError("User not found or already deleted ", 404);
    }
    return res.status(200).json({ message: "success to freze account 😎" });
  };
  unfrezeUser = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } : freezeSchemaType = req.params  as unknown as freezeSchemaType;
    if (req.user?.role !== RoleType.admin) {
      throw new CustomError("unauthorized", 401);
    }


     const requesterId = req.user?._id.toString();
  const targetId = userId.toString();

  if (requesterId === targetId) {
    throw new CustomError("You cannot unfreeze your own account", 400);
  }
    const user = await this._userModel.findOneAndupdate(
      { _id: userId ,deletedAt:{ $exists: true }},
      {
      $unset: { deletedAt: "", deletedBy: "" },
        restordAt : new Date(),
        restoredBy : req.user?._id
      }
    );
    if (!user) {
      throw new CustomError("User not found or already deleted ", 404);
    }
    return res.status(200).json({ message: "success to unfreze account 😎 👌" });
  };

dashpoard = async (req: Request, res: Response, next: NextFunction) => {
  //  const user = await this._userModel.Find({filter:{},select:{},options:{ lean: true }});
  //  const posts = await this._postModel.Find({filter:{},select:{},options:{ lean: true }});
 const result = await Promise.allSettled([
  this._userModel.Find({filter:{},select:{},options:{ lean: true }}),
  this._postModel.Find({filter:{},select:{},options:{ lean: true }})
 ])

  return res.status(200).json({ message: "success" , result});
 };

 updateRole= async (req: Request, res: Response, next: NextFunction) => {
const { userId } : freezeSchemaType = req.params  as unknown as freezeSchemaType;   
const { role:newRole }= req.body  

const denyRolus : RoleType[] = [ newRole,RoleType.superAdmin]
if (req.user?.role !== RoleType.admin) {
  denyRolus.push(RoleType.admin)
  if (newRole===RoleType.superAdmin) {
    throw new CustomError("unauthorized", 401);
  }
}

const user = await this._userModel.findOneAndupdate(
  { _id: userId,role: { $nin: denyRolus }},{
  $set: { role: newRole }
  
},{
  new: true}

);
if (!user) {
  throw new CustomError("User not found or already deleted ", 404);
}
return res.status(200).json({ message: "success to update role 😎" });

  }



  sendRequest = async (req: Request, res: Response, next: NextFunction) => {

    const { userId } = req.params;

    const user = await this._userModel.findOne({ _id: userId });
    if (!user) {
      throw new CustomError ("User not found", 404);
    }

    if (req.user?._id.toString() === userId) {
      throw new CustomError ("You can't send a request to yourself", 400);
    }

    const checkRequest = await this._FrindRquestModel.findOne({
      $or: [
        { createdBy: req.user?._id, sendTo: userId },
        { createdBy: userId, sendTo: req.user?._id },
      ],
    });

    if (checkRequest) {
      throw new CustomError ("Request already sent", 400);
    }

    const friendRequest = await this._FrindRquestModel.create({
      createdBy: req.user?._id as unknown as Types.ObjectId,
      sendTo: userId as unknown as Types.ObjectId,
    });

    return res.status(200).json({ message: "success", friendRequest });

};


acceptRequest = async (req: Request, res: Response, next: NextFunction) => {
  const { requestId } = req.params; 
  const add =await this._FrindRquestModel.findOne(
        {
      _id: requestId,
      sendTo: req.user?._id,
      acceptedAt: { $exists: false },
      accpted: { $exists: false },
    }
  )
  if (add?.accpte === true) {
    throw new CustomError("request already accepted", 404);
  }

  
  const checkRequest = await this._FrindRquestModel.findOneAndupdate(
    {
      _id: requestId,
      sendTo: req.user?._id,
      acceptedAt: { $exists: false },
      accpted: { $exists: false },
    },
    {
      accptedAt: new Date(),
      accpte: true,
    },
    { new: true }
  );

  if (!checkRequest) {
    throw new  CustomError("request not found", 404);
  }


  await Promise.all([
    this._userModel.updateone(
      { _id: checkRequest.createdBy },
      { $addToSet: { friends: checkRequest.sendTo } }
    ),
    this._userModel.updateone(
      { _id: checkRequest.sendTo },
      { $addToSet: { friends: checkRequest.createdBy } }
    ),
  ]);

  return res.status(200).json({ message: "success" , checkRequest});
};


//! graphql

getOneuser= async (parent: any, args: any, context: any) => {


  const token = context?.req.headers?.authorization

  const {user}=await authantcationGraph(token)

  await AuthorizationGQL({accessRoles:[RoleType.admin ,RoleType.superAdmin,RoleType.user ],role:user?.role as RoleType})
  // await ValidationGQL(getGraphQlSchema, args)
const userExist  = await this._userModel.findOne({ _id:user._id });
if (!userExist) {
    throw new GraphQLError("User not found", {
    extensions: {
      message: "USER_NOT_FOUND",
      statusCode: 404,
    },
  });
}
return user
}

getAllUsers= async (parent: any, args: any) => {

const users = await this._userModel.find({});
if (!users) {
  throw new GraphQLError("Users not found", {
    extensions: {
      message: "USERS_NOT_FOUND",
      statusCode: 404,
    },
  });
}
return users

}

createUser= async (parent: any, args: any) => {

const { lName, fName, email, password ,age ,phone,address} = args;
console.log(args);

const user = await this._userModel.findOne({  email });
console.log(user);

if (user) {
  throw new GraphQLError("User already exist", {
    extensions: {
      message: "USER_ALREADY_EXIST",
      statusCode: 409,
    },
  });
}
const hashPassword = await Hash(password, 10);
const newUser = await this._userModel.create({
  lName,
  fName,
  email,
  password: hashPassword,
  age,
  phone,
  address
});
if (!newUser) {
  throw new GraphQLError("User  not created", {
    extensions: {
      message: "USER_NOT_CREATED",
      statusCode:  400,
    },
  });
}
return newUser


}
 
}

export default new UserService();
