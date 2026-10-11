import mongoose, { Schema } from "mongoose";

const doctorSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        specialization: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true
        },
        availability: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true
    }
)

export const Doctor = mongoose.model("Doctor", doctorSchema)