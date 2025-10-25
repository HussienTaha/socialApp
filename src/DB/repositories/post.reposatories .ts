import { Model } from "mongoose";
import { DBrepositories } from "./DB.repositories";
import { IPost } from "../models/post.model";
export class postRepository extends DBrepositories<IPost> {
  constructor(protected readonly model: Model<IPost>) {
    super(model);
  }
}
