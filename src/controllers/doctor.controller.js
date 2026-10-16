import { Doctor } from "../models/doctor.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js"


const createDoctorProfile = asyncHandler(async (req, res) => {

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

export { createDoctorProfile, getDoctorProfile }