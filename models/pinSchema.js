import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const pinSchema = new Schema({
    pinId: { type: String, required: true, unique: true },
    location: {
        longitude: { type: Number, required: true },
        latitude: { type: Number, required: true },
    },
    adder: { type: String, trim: true, required: true },
    infomation: { type: String, trim: true, required: false },

    type: {
        type: String,
        enum: ["Recycling Bin", "Recycling Centre", "Donation Bin",
            "Donation Centre"],
        required: true
    },
     status: {
        type: String,
        enum: ["pending", "rejected", "approved"],
        required: true
    },

    isPending: { // or pending reason
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
