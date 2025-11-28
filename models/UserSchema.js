import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const userSchema = new Schema({
  subid: { type: String, required: true, unique: true },
  firstname: { type: String, trim: true },
  lastname: { type: String, trim: true },


  email: { type: String, trim: true, lowercase: true, required: true, unique: true },
 
  password: { type: String, required: true },

  accountStatus: {
    type: String,
    enum: ["Active", "Inactive", "Suspended", "Deleted", "pending"],
    default: "active"
  },

  role: {
    type: String,
    enum: [
      "Admin", "User",
    ],
    default: "User"
  },




}, { timestamps: true });


const User = model("User", userSchema);
export default User;
