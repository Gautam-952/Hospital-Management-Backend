import mongoose, { Schema } from "mongoose";

const patientSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        dob: {
            type: Date,
            required: true,
        },
        gender: {
            type: String,
            enum: ["male", "female", "others"],
            required: true,
            lowercase: true
        },
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        address: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
)

export const Patient = mongoose.model("Patient", patientSchema)