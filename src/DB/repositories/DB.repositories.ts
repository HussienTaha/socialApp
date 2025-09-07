import { HydratedDocument, ProjectionType, RootFilterQuery } from "mongoose";
import { Model } from "mongoose";
export abstract class DBrepositories<TDocument> {
  constructor(protected readonly model: Model<TDocument>) {}
  async create(data: Partial<TDocument>): Promise<HydratedDocument<TDocument>> {
    return this.model.create(data);
  }
  async findOne(
    filter: RootFilterQuery<TDocument>,
    selecth?: ProjectionType<TDocument>
  ): Promise<HydratedDocument<TDocument> | null> {
    return this.model.findOne(filter);
  }
}
