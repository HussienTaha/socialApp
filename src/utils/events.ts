import { sendEmail } from "./../service/sendEmail";
import { EventEmitter } from "events";
import { generateOtp } from "../service/sendEmail";
import { emailTemplet } from "../service/emailTemplet";
import { set } from "mongoose";
import tr from "zod/v4/locales/tr.js";
import { deleteFile, gitFile } from "./s3config";
import { UserRepository } from "../DB/repositories/user.reposatories";
import userModel from "../DB/models/user.model";

export const eventEmitter = new EventEmitter();
eventEmitter.on("confermemail", async (data) => {
  const { email, otp } = data;

  await sendEmail({
    to: email,
    subject: "Account Verification",
    html: emailTemplet(otp),
  });
});
eventEmitter.on("forgetpassword", async (data) => {
  const { email, otp } = data;

  await sendEmail({
    to: email,
    subject: "Account Verification",
    html: emailTemplet(otp),
  });

  eventEmitter.on("uplodeProfileImage", async (data) => {
    const { Key, oldkey, userId, expiresIn } = data;

    console.log(data);
    const _userModel = new UserRepository(userModel);

    setTimeout(async () => {
      try {
        await gitFile({ Key });
             await _userModel.findOneAndupdate({ _id: userId },{ $unset: { tempProfileImage: "" } });
            if (oldkey) {
    await deleteFile({ Key: oldkey });
            }
        console.log("success");
      } catch (error: any) {
        console.log(error);
        if (error?.code == "NoSuchKey") {
          if (oldkey) {
            await _userModel.findOneAndupdate(
              { _id: userId },
              { $unset: { profileImage: "" } }
            );
          } else {
            await _userModel.findOneAndupdate(
              { _id: userId },
              { $set: { profileImage: oldkey } },
              { $unset: { tempProfileImage: "" } }
            );
          }
        }
      }
    }, expiresIn * 1000);
  });
});
