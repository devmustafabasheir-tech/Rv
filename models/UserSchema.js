import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const userSchema = new Schema({
  subid: { type: String, required: true, unique: true },
  firstname: { type: String, trim: true },
  lastname: { type: String, trim: true },
  username: { type: String, required: true, unique: true },

  point: { type: String, required: true, default: 0, trim: true },
  email: { type: String, trim: true, lowercase: true, required: true, unique: true },

  password: { type: String, required: true },

  accountStatus: {
    type: String,
    enum: ["active", "inactive", "suspended", "deleted", "pending"],
    default: "active"
  },

  role: {
    type: String,
    enum: [
      "admin", "user",
    ],
    default: "user"
  },


}, { timestamps: true });


const User = model("User", userSchema);
export default User;
