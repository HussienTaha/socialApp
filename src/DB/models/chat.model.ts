import mongoose, { Schema,model, models, Types } from "mongoose";
import { required } from "zod/mini";
export interface IMessage {
    content: string,
    createdBy: Types.ObjectId,
   createdAt?:Date,
   updatedAt?:Date
}
export interface IChat {
    //! one to one 
participants: Types.ObjectId[],
createdBy: Types.ObjectId
messages: IMessage[]

//! one to many group
group?:string
groupImage?:string
roomId?:string
createdAt:Date,
updatedAt:Date


}
const MessageSchema = new Schema<IMessage>({
    content: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User",required: true },

},{
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
});

const chatSchema = new Schema<IChat>({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User",required: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User",required: true },
    messages: [MessageSchema],
    group: String,
    groupImage: String,
    roomId: String,
 
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
});

export const ChatModel = mongoose.models.Chat || mongoose.model<IChat>("Chat", chatSchema); 