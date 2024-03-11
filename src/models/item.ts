import { Schema, model, Document, Types } from "mongoose";

const Item = model('Item', new Schema({
  created: {type: Schema.Types.ObjectId, ref: "User", require: true},
  name: {type: String, required: true},
  value: {type: Number, required: true},
  belong: {type: Schema.Types.ObjectId, ref: "List", require: true},
  date: {type: Date, require: true},
}));

export interface ItemType extends Document {
  created?: Types.ObjectId | null,
  name?: string | null,
  value?: number | null,
  belong?: Types.ObjectId | null,
  date?: Date | null,
}

export default Item;