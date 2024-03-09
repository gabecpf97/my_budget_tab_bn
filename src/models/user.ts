import { Schema, model, Document, Types } from "mongoose";

const User = model('User', new Schema({
  name: {type: String, require: true},
  email: {type: String, require: true},
  password: {type: String, require: true},
  list: [{type: Schema.Types.ObjectId, ref: "List"}],
  date: {type: Date, require: true},
}));

export interface UserType extends Document {
  name?: string | null,
  email?: string | null,
  password?: string | null,
  list?: Types.ObjectId[],
  date?: Date | null,
}

export default User;