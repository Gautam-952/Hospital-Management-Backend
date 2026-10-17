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

export { createPatient }