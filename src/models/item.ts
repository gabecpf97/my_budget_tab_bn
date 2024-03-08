import { Schema, model, Document } from "mongoose";

const Item = model('Item', new Schema({
  created: {type: Schema.Types.ObjectId, ref: "User", require: true},
  name: {type: String, required: true},
  value: {type: Number, required: true},
  date: {type: Date, require: true},
}));

export interface ItemType extends Document {
  created: Schema.Types.ObjectId,
  name: String,
  value: Number,
  date: Date,
}

export default Item;