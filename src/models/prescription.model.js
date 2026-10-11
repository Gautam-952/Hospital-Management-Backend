import mongoose, { Schema } from "mongoose";

const prescriptionSchema = new Schema(
    {
        appointment_id: {
            type: Schema.Types.ObjectId,
            ref: "Appointment",
            required: true,
            unique: true,
        },
        diagnosis: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        medicines: [{
            type: String,
            trim: true
        }],
        notes: {
            type: String,
            lowercase: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
)

export const Prescription = mongoose.model("Prescription", prescriptionSchema)