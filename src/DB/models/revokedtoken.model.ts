import mongoose, { Types } from "mongoose";
export interface IRevokedToke  {
    userId: Types.ObjectId;
    tokenId: string;
    expireAt: Date;
}

export const revokedTokenSchema = new mongoose.Schema<IRevokedToke>({
    userId: { type:mongoose.Schema.Types.ObjectId, required: true },
    tokenId: { type: String, required: true },
    expireAt: { type: Date, required: true },
},{
    timestamps: true,
    toJSON: {
        virtuals: true
    },    
    toObject: {
        virtuals: true  
    }
    }
);

const RevokedTokenModel= mongoose.models.RevokedToken || mongoose.model<IRevokedToke>("RevokedToken",revokedTokenSchema)
export default RevokedTokenModel