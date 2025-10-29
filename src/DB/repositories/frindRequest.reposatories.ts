import { IFrindRequst } from '../models/frindRequst.model';
import { Model } from "mongoose";
import { DBrepositories } from "./DB.repositories";
import { IComment } from "../models/comment.model ";
export class frindRequesrRepository extends DBrepositories<IFrindRequst> {
  constructor(protected readonly model: Model<IFrindRequst>) {
    super(model);
  }
}
