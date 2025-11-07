import { DeleteResult, HydratedDocument, ProjectionType, QueryOptions, RootFilterQuery, UpdateQuery, UpdateWriteOpResult } from "mongoose";
import { Model } from "mongoose";
export abstract class DBrepositories<TDocument> {
  constructor(protected readonly model: Model<TDocument>) {}
  async create(data: Partial<TDocument>): Promise<HydratedDocument<TDocument>> {
    return this.model.create(data);
  }
  async findOne(
    filter: RootFilterQuery<TDocument>,
    select?: ProjectionType<TDocument>,
    options?: QueryOptions<TDocument>
  ): Promise<HydratedDocument<TDocument> | null> {
    return this.model.findOne(filter, select, options);
  }
  

  async find(
  filter: RootFilterQuery<TDocument>,
  select?: ProjectionType<TDocument>,
  options?: QueryOptions<TDocument>
): Promise<HydratedDocument<TDocument>[]> {
  return await this.model.find(filter, select, options);
}
async Find({
  filter,
  select,
  options,
}: {
  filter: RootFilterQuery<TDocument>;
  select?: ProjectionType<TDocument>;
  options?: QueryOptions<TDocument>;
}): Promise<HydratedDocument<TDocument>[]> {
  return this.model.find(filter, select, options);
}
async paginate({
  filter,
  query,
  select,
  options,
}: {
  filter: RootFilterQuery<TDocument>;
  query: {
    page: number;
    limit: number;
  };
  select?: ProjectionType<TDocument>;
  options?: QueryOptions<TDocument>;
}) {
 let {page,limit}=query
 
if (page<0){
  page
}
page =page * 1||1

const skip=(page-1)*limit

const filnaloptions={
  ...options,
  skip,
  limit
}

const count = await this.model.countDocuments({deletedAt:{$exists:false}});
const numberofpages = Math.ceil(count / limit)
  const doc=await this.model.find(filter, select, filnaloptions);
  return{doc , currentPage:page,count,numberofpages}
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
