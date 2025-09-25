import { Schema, model, Document } from "mongoose";

enum AllowCommentEnum {
  ALLOW = "ALLOW",
  DISALLOW = "DISALLOW",
}

enum AvailabilityEnum {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}


export interface IPost extends Document {
  content: string;
  attachments?: string[];
  assetFolderId?: string;

  createdBy: Schema.Types.ObjectId;

  tags?: Schema.Types.ObjectId[];
  likes?: Schema.Types.ObjectId[];

  allowComment: AllowCommentEnum;
  availability: AvailabilityEnum;

  deleteAt?: Date;
  deletedBy?: Schema.Types.ObjectId;

  restoreAt?: Date;
  restoredBy?: Schema.Types.ObjectId;
}

const postSchema = new Schema<IPost>(
  {
    content: { type: String, minlength: 5, maxlength: 10000, required: true },
    attachments: [String],
    assetFolderId: String,

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    tags: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],

    allowComment: {
      type: String,
      enum: Object.values(AllowCommentEnum),
      default: AllowCommentEnum.ALLOW,
    },
    availability: {
      type: String,
      enum: Object.values(AvailabilityEnum),
      default: AvailabilityEnum.PUBLIC,
    },

    deleteAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },

    restoreAt: { type: Date },
    restoredBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const PostModel = model<IPost>("Post", postSchema);
