import { Model } from "mongoose";
import { DBrepositories } from "./DB.repositories";
import { IRevokedToke } from "../models/revokedtoken.model";
export class RevokedTokenRepository extends DBrepositories<IRevokedToke> {
  constructor(protected readonly model: Model<IRevokedToke>) {
    super(model);
  }
}
