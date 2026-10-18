import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Prescription } from "../models/prescription.model.js";
import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.model.js";
import { Patient } from "../models/patient.model.js";

const createPrescription = asyncHandler(async (req, res) => {
    if (req.user?.role !== "doctor") {
        throw new ApiError(403, "Access Denied. Only doctors can write prescriptions.");
    }

    const { appointment_id, diagnosis, medicines, notes } = req.body;

    if (!appointment_id || !diagnosis || !medicines) {
        throw new ApiError(400, "appointment_id, diagnosis, and medicines are required.");
    }

    if (!Array.isArray(medicines) || medicines.length === 0) {
        throw new ApiError(400, "medicines must be a non-empty array of strings.");
    }

    const doctor = await Doctor.findOne({ user_id: req.user._id });
    if (!doctor) {
        throw new ApiError(404, "Doctor profile not found.");
    }

    const appointment = await Appointment.findById(appointment_id);
    if (!appointment) {
        throw new ApiError(404, "Appointment not found.");
    }

    if (appointment.doctor_id.toString() !== doctor._id.toString()) {
        throw new ApiError(403, "Access Denied. You can only write prescriptions for your own appointments.");
    }

    const existingPrescription = await Prescription.findOne({ appointment_id });
    if (existingPrescription) {
        throw new ApiError(400, "A prescription already exists for this appointment.");
    }

    const prescription = await Prescription.create({
        appointment_id,
        diagnosis,
        medicines,
        notes: notes || ""
    });

    if (appointment.status !== "completed") {
        appointment.status = "completed";
        await appointment.save();
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                prescription,
                "Prescription created successfully."
            ));
});

const getPrescriptionByAppointment = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;

    const prescription = await Prescription.findOne({ appointment_id: appointmentId }).populate({
        path: "appointment_id",
        select: "appointment_date status reason patient_id doctor_id",
        populate: [
            {
                path: "doctor_id",
                select: "specialization department user_id",
                populate: {
                    path: "user_id",
                    select: "userName email avatar"
                }
            },
            {
                path: "patient_id",
                select: "phone address user_id",
                populate: {
                    path: "user_id",
                    select: "userName email avatar"
                }
            }
        ]
    });

    if (!prescription) {
        throw new ApiError(404, "Prescription not found for this appointment.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                prescription,
                "Prescription fetched successfully."
            ));
});

const getMyPrescriptions = asyncHandler(async (req, res) => {
    if (req.user?.role !== "patient") {
        throw new ApiError(403, "Access Denied. Only patients can access their prescriptions.");
    }

    const patient = await Patient.findOne({ user_id: req.user._id });
    if (!patient) {
        throw new ApiError(404, "Patient profile not found.");
    }

    const patientAppointments = await Appointment.find({ patient_id: patient._id }).select("_id");
    const appointmentIds = patientAppointments.map((appt) => appt._id);

    const prescriptions = await Prescription.find({
        appointment_id: { $in: appointmentIds }
    })
        .populate({
            path: "appointment_id",
            select: "appointment_date status reason doctor_id",
            populate: {
                path: "doctor_id",
                select: "specialization department user_id",
                populate: {
                    path: "user_id",
                    select: "userName email avatar"
                }
            }
        })
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                prescriptions,
                "Prescriptions fetched successfully."
            ));
});

export { createPrescription, getPrescriptionByAppointment, getMyPrescriptions };