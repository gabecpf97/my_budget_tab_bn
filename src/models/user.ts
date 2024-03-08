import { Schema, model, Document } from "mongoose";

const User = model('User', new Schema({
  name: {type: String, required: true},
  list: [{type: Schema.Types.ObjectId, ref: "List"}],
  date: {type: Date, require: true},
}));

export interface UserType extends Document {
  name: String,
  list: Schema.Types.ObjectId[],
  date: Date,
}

export default User;