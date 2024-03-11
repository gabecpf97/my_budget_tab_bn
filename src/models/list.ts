import { Schema, model, Document, Types } from "mongoose";

const List = model('List', new Schema({
  created: {type: Schema.Types.ObjectId, ref: "User", require: true},
  name: {type: String, required: true},
  date: {type: Date, require: true},
  budget: {type: Number, require: true},
  items: [{type: Schema.Types.ObjectId, ref: "Item"}],
}));

export interface ListType extends Document {
  created?: Types.ObjectId | null,
  name?: String | null,
  date?: Date | null,
  budget?: number | null,
  items?: Types.ObjectId[],
}

export default List;