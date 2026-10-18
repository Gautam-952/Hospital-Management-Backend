import { Appointment } from "../models/appointment.model.js";
import { Patient } from "../models/patient.model.js"
import { Doctor } from "../models/doctor.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const bookAppointment = asyncHandler(async (req, res) => {

    if (req.user?.role !== "patient") {
        throw new ApiError(403, "Access Denied.")
    }

    const { doctor_id, appointment_date, reason } = req.body

    if (!doctor_id || !appointment_date || !reason) {
        throw new ApiError(400, "All credentials are Required.")
    }

    const patient = await Patient.findOne({ user_id: req.user._id })
    if (!patient) {
        throw new ApiError(404, "Patient not Found.")
    }

    const doctor = await Doctor.findById(doctor_id)
    if (!doctor) {
        throw new ApiError(404, "Doctor not Found.")
    }

    const slotDurationInMs = 30 * 60 * 1000;
    const slotStart = new Date(new Date(appointment_date).getTime() - slotDurationInMs);
    const slotEnd = new Date(new Date(appointment_date).getTime() + slotDurationInMs);

    const existingAppointment = await Appointment.findOne({
        doctor_id,
        status: "scheduled",
        appointment_date: {
            $gt: slotStart,
            $lt: slotEnd
        }
    });

    if (existingAppointment) {
        throw new ApiError(409, "Doctor is already booked around this time.");
    }

    const appointment = await Appointment.create({ patient_id: patient._id, appointment_date, reason, doctor_id })
    if (!appointment) {
        throw new ApiError(500, "Something went wrong while creating Appointment.")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                appointment,
                "Appointment created Successfully."
            )
        )

})

const getMyAppointment = asyncHandler(async (req, res) => {

    if (req.user?.role !== "patient") {
        throw new ApiError(403, "Access Denied.")
    }

    const patient = await Patient.findOne({ user_id: req.user._id })
    if (!patient) {
        throw new ApiError(404, "Patient profile not Found.")
    }

    const appointments = await Appointment.find({ patient_id: patient._id })
        .populate({
            path: "doctor_id",
            select: "specialization department user_id",
            populate: {
                path: "user_id",
                select: "userName email avatar"
            }
        })
        .populate({
            path: "patient_id",
            select: "phone address user_id",
            populate: {
                path: "user_id",
                select: "userName email avatar"
            }
        })
        .sort({ appointment_date: -1 })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                appointments,
                "Appointment fetched Successfully."
            )
        )

})

const getDoctorAppointment = asyncHandler(async (req, res) => {

    if (req.user?.role !== "doctor") {
        throw new ApiError(403, "Access Denied.")
    }

    const doctor = await Doctor.findOne({ user_id: req.user._id })
    if (!doctor) {
        throw new ApiError(404, "Doctor not Found.")
    }

    const appointments = await Appointment.find({ doctor_id: doctor._id })
        .populate({
            path: "patient_id",
            select: "phone address dob gender user_id",
            populate: {
                path: "user_id",
                select: "userName email avatar"
            }
        })
        .sort({ appointment_date: 1 })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                appointments,
                "Doctor Appointment fetched Successfully."
            )
        )

})

const updateAppointmentStatus = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    const { status } = req.body;

    if (!status) {
        throw new ApiError(400, "Status is required.");
    }

    const validStatuses = ["scheduled", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
        throw new ApiError(400, `Invalid status. Allowed values: ${validStatuses.join(", ")}`);
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        throw new ApiError(404, "Appointment not found.");
    }

    if (req.user?.role === "doctor") {
        const doctor = await Doctor.findOne({ user_id: req.user._id });
        if (!doctor || appointment.doctor_id.toString() !== doctor._id.toString()) {
            throw new ApiError(403, "Access denied. You can only update your own appointments.");
        }
    } else if (req.user?.role === "patient") {
        const patient = await Patient.findOne({ user_id: req.user._id });
        if (!patient || appointment.patient_id.toString() !== patient._id.toString()) {
            throw new ApiError(403, "Access denied. You can only update your own appointments.");
        }
        if (status !== "cancelled") {
            throw new ApiError(403, "Patients can only cancel appointments.");
        }
    } else {
        throw new ApiError(403, "Access denied.");
    }

    appointment.status = status;
    await appointment.save();

    return res
        .status(200)
        .json(new ApiResponse(200, appointment, "Appointment status updated successfully."));
});

export { bookAppointment, getMyAppointment, getDoctorAppointment, updateAppointmentStatus }