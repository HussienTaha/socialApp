import { DeleteResult, HydratedDocument, ProjectionType, QueryOptions, RootFilterQuery, UpdateQuery, UpdateWriteOpResult } from "mongoose";
import { Model } from "mongoose";
export abstract class DBrepositories<TDocument> {
  constructor(protected readonly model: Model<TDocument>) {}
  async create(data: Partial<TDocument>): Promise<HydratedDocument<TDocument>> {
    return this.model.create(data);
  }
  async findOne(
    filter: RootFilterQuery<TDocument>,
    select?: ProjectionType<TDocument>
  ): Promise<HydratedDocument<TDocument> | null> {
    return this.model.findOne(filter);
  }

  async find(
  filter: RootFilterQuery<TDocument>,
  select?: ProjectionType<TDocument>,
  options?: QueryOptions<TDocument>
): Promise<HydratedDocument<TDocument>[]> {
  return await this.model.find(filter, select, options);
}


async updateone(
    filter: RootFilterQuery<TDocument>,
    update: UpdateQuery<TDocument>
  ): Promise<UpdateWriteOpResult> {
    return this.model.updateOne(filter, update);
  }
async findOneAndupdate(
  filter: RootFilterQuery<TDocument>,
  update: UpdateQuery<TDocument>,
  options: QueryOptions<TDocument> | null = { new: true }
): Promise<TDocument | null> {
  return await this.model.findOneAndUpdate(filter, update, options);
}



async deleteone(
    filter: RootFilterQuery<TDocument>,

  ): Promise<DeleteResult> {
    return this.model.deleteOne(filter);
  }

}
