import { file } from "zod";
import { UserRepository } from "./../../DB/repositories/user.reposatories";
import { HydratedDocument, Model } from "mongoose";
import {
  confermedotpSchemaType,
  flagType,
  forgetPasswordSchemaType,
  freezeSchemaType,
  logoutSchemaType,
  reasetPasswordSchemaType,
  signUpschemaType,
} from "./user.vaildation";
import { NextFunction, Request, Response } from "express";
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
import { allowedTypesEnum } from "../../middleware/multer.cloud";
import ur from "zod/v4/locales/ur.js";

class UserService {
  // private _userModel:Model<IUser>=userModel
  //  private _userModel= new DBrepositories<IUser>(userModel)
  private _userModel = new UserRepository(userModel);
  private _revokedModel = new RevokedTokenRepository(RevokedTokenModel);

  constructor() {}
  signup = async (req: Request, res: Response, next: NextFunction) => {
    let {
      userName,
      email,
      password,
      lName,
      fName,
      cpassword,
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
        user?.role == RoleType.user
          ? process.env.USER_ACCESS_TOKEN_KEY!
          : process.env.ADMIN_ACCESS_TOKEN_KEY!,
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
    const accessTokenAndRefreshToken = {
      accessToken,
      refreshToken,
    };

    res.status(200).json({
      message: "User logged in successfully",
      accessTokenAndRefreshToken,
    });
  };
  //  greate get user service
  gitprofile = async (req: Request, res: Response, next: NextFunction) => {
    return res
      .status(200)
      .json({ message: "profile get successfully", user: req.user });
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
      .json({ message: "success to uplod image", key: key });
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
}

export default new UserService();
