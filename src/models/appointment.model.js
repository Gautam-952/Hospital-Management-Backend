import mongoose, { Schema } from "mongoose";

const appointmentSchema = new Schema(
    {
        patient_id: {
            type: Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        doctor_id: {
            type: Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
        },
        status: {
            type: String,
            required: true,
            lowercase: true,
            enum: ["scheduled", "completed", "cancelled"],
            default: "scheduled"
        },
        reason: {
            type: String,
            required: true
        },
        appointment_date: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
)

export const Appointment = mongoose.model("Appointment", appointmentSchema)