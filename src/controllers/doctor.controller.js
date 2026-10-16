import { Doctor } from "../models/doctor.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js"


const createDoctorProfile = asyncHandler(async (req, res) => {

    if (req.user?.role !== "doctor") {
        throw new ApiError(403, "Access Denied. Only doctors can perform this action.")
    }

    const { specialization, availability } = req.body
    if (!specialization || !availability) {
        throw new ApiError(400, "All credentials should be filled.")
    }

    const alreadyDoctor = await Doctor.findOne({ user_id: req.user._id })
    if (alreadyDoctor) {
        throw new ApiError(409, "Doctor already exsists.")
    }

    const createdDoctor = await Doctor.create({ user_id: req.user._id, specialization, availability })
    if (!createdDoctor) {
        throw new ApiError(500, "Something went wrong by creating Doctor.")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                createdDoctor,
                "Doctor Created Successfully."
            )
        )

})

const getDoctorProfile = asyncHandler(async (req, res) => {
    const doctorId = req.params.id
    let query = {}

    if (doctorId) {
        query = { $or: [{ _id: doctorId }, { user_id: doctorId }] }
    } else {
        query = { user_id: req.user?._id }
    }

    const doctorProfile = await Doctor.findOne(query).populate("user_id", "name email")
    if (!doctorProfile) {
        throw new ApiError(404, "Doctor Profile not found.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                doctorProfile,
                "Doctor profile fetched Successfully."
            )
        )

})

const getAllDoctor = asyncHandler(async (req, res) => {
    const { specialization } = req.query

    let filter = {}
    if (specialization) {
        filter.specialization = specialization
    }

    const filteringDocs = await Doctor.find(filter).populate("user_id", "name email")

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                filteringDocs,
                "The specialization fetched successfully."
            )
        )

})

const updateDoctorAvailability = asyncHandler(async (req, res) => {

    if (req.user?.role !== "doctor") {
        throw new ApiError(403, "Access Denied. Only doctors can perform this action.")
    }

    const { availability } = req.body
    if (!availability) {
        throw new ApiError(400, "No availability data is found.")
    }

    const updatedDoctor = await Doctor.findOneAndUpdate(
        { user_id: req.user._id },
        { $set: { availability } },
        { new: true }
    )

    if (!updatedDoctor) {
        throw new ApiError(404, "Doctor profile not found.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedDoctor,
                "Doctors Availability Changed Successfully."
            )
        )

})

export { createDoctorProfile, getDoctorProfile, getAllDoctor, updateDoctorAvailability }