import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const pinSchema = new Schema({
    pinId: { type: String, required: true, unique: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    adder: { type: String, trim: true, required: true },
    infomation: { type: String, trim: true, required: true },

    type: {
        type: String,
        enum: ["Recycling Bin", "Centre", "Donation Bin"],
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "rejected", "approved"],
        required: true
    },

    isPending: {
        type: String,
        enum: ["active", "pending deletion", "pending addition"],
        default: "active"
    },

    handeldBy: { type: String, trim: true },
    reportedBy: { type: String, trim: true },

    user: { type: Types.ObjectId, ref: 'User' },

}, { timestamps: true });

pinSchema.index({ location: '2dsphere' });

const Pin = model("Pin", pinSchema);
export default Pin;
