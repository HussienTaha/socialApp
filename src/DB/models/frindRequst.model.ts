import mongoose, { Schema, model, Document, models, Types } from "mongoose";




export interface IFrindRequst 
  {

  createdBy: Types.ObjectId;
sendTo: Types.ObjectId;

 accptedAt?: Date;
 accpte?: boolean



}

 export const FrindRquestSchema = new Schema<IFrindRequst>(
  {

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sendTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    accptedAt: { type: Date },
    accpte: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    strictQuery: true,
  }

);


FrindRquestSchema.pre(["find", "findOne" ,"findOneAndUpdate"], async function (next) {
  const query = this.getQuery();
  const {
   paranoid, ...rest
  }=query
  if (paranoid===false) {
this.setQuery({...rest})
  }
  else{
    this.setQuery({...rest,deleteAt:{$exists:false}})
  }
  next();
  
})

 const FrindRquestModel = models.FrindRquest || model("FrindRquest", FrindRquestSchema);
export default FrindRquestModel