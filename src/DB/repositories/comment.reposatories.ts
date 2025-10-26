import { Model } from "mongoose";
import { DBrepositories } from "./DB.repositories";
import { IComment } from "../models/comment.model ";
export class commentRepository extends DBrepositories<IComment> {
  constructor(protected readonly model: Model<IComment>) {
    super(model);
  }
}
