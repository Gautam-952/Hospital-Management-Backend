import { Patient } from "../models/patient.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js"

const createPatient = asyncHandler(async (req, res) => {

    if (req.user?.role !== "patient") {
        throw new ApiError(403, "Access denied. Only patient can perform this action.")
    }

    const { dob, gender, phone, address } = req.body

    if (!dob || !gender || !phone || !address) {
        throw new ApiError(400, "All credentials are required.")
    }

    const patient = await Patient.findOne({ user_id: req.user._id })
    if (patient) {
        throw new ApiError(409, "Patient already exsists.")
    }

    const createdPatient = await Patient.create({ user_id: req.user._id, dob, gender, phone, address })

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                createdPatient,
                "Patient Created Successfully."
            )
        )

})

const getPatientProfile = asyncHandler(async (req, res) => {

    if (req.user?.role !== "patient") {
        throw new ApiError(403, "Access denied. Only patient can perform this action.")
    }

    const patient = await Patient.findOne({ user_id: req.user._id }).populate("user_id", "userName email avatar")
    if (!patient) {
        throw new ApiError(404, "Patient Does no exsists.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                patient,
                "Patient profile fetched SuccessFully."
            )
        )

})

const updatePatientProfile = asyncHandler(async (req, res) => {

    if (req.user?.role !== "patient") {
        throw new ApiError(403, "Access denied. Only patient can perform this action.")
    }

    const { phone, address, dob } = req.body
    if (!(phone || address || dob)) {
        throw new ApiError(400, "Please fill the credentials.")
    }

    const updateField = {}
    if (phone !== undefined) {
        updateField.phone = phone
    }
    if (address !== undefined) {
        updateField.address = address
    }
    if (dob !== undefined) {
        updateField.dob = dob
    }


    const patient = await Patient.findOneAndUpdate(
        { user_id: req.user._id },
        {
            $set: updateField
        },
        { new: true }

    )

    if (!patient) {
        throw new ApiError(404, "Patient profile not found.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                patient,
                "Credentials Changed Successfully."
            )
        )

})

export { createPatient, getPatientProfile, updatePatientProfile }