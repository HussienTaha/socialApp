import { CustomError } from './../../utils/classErrorHandling';
import { HydratedDocument, Model } from 'mongoose';
import { IUser } from './../models/user.model';
import { DBrepositories } from './DB.repositories';
export class UserRepository extends DBrepositories<IUser> {
constructor(protected readonly model:Model<IUser>) {
super(model)

}

async createOneUser(data: Partial<IUser>): Promise<HydratedDocument<IUser>> {
const user: HydratedDocument<IUser> = await this.model.create(data)
if (!user) {
throw new CustomError("fail to create")

}

return user
}
}