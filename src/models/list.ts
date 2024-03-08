import { Schema, model, Document } from "mongoose";

const List = model('List', new Schema({
  created: {type: Schema.Types.ObjectId, ref: "User", require: true},
  name: {type: String, required: true},
  date: {type: Date, require: true},
  budget: {type: Number, require: true},
  items: [{type: Schema.Types.ObjectId, ref: "Item"}],
}));

export interface ListType extends Document {
  created: Schema.Types.ObjectId,
  name: String,
  date: Date,
  budget: Number,
  items: Schema.Types.ObjectId[],
}

export default List;