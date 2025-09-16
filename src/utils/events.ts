import { sendEmail } from './../service/sendEmail';
import { EventEmitter } from "events";
import { generateOtp } from "../service/sendEmail";
import { emailTemplet } from "../service/emailTemplet";

export const eventEmitter = new EventEmitter();
eventEmitter.on( "confermemail", async(data) => {
    const {email,otp} =data
        
                await sendEmail({
                    to: email,
                    subject: "Account Verification",
                    html:emailTemplet(otp) ,
    
                })

});