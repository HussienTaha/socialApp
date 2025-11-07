import { Model } from "mongoose";
import { DBrepositories } from "./DB.repositories";
import { IComment } from "../models/comment.model ";
import { IChat } from "../models/chat.model";
export class chatRepository extends DBrepositories<IChat> {
  constructor(protected readonly model: Model<IChat>) {
    super(model);
  }
}
