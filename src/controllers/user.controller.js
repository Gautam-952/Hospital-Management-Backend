import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res, next) => {
    const { userName, email, password, role } = req.body

    if (!userName || !email || !password || !role) {
        throw new ApiError(400, "All credentials should be filled.")
    }

    const exsistedUser = await User.findOne({ $or: [{ email }, { userName }] })
    if (exsistedUser) {
        throw new ApiError(409, "User already exsists.")
    }

    const localPathUrl = req.file?.path
    if (!localPathUrl) {
        throw new ApiError(400, "Avatar file is required.")
    }
    const avatar = await uploadOnCloudinary(localPathUrl)

    const newUser = await User.create({
        userName,
        email,
        password,
        role,
        avatar: avatar.url,
    })

    const createdUser = await User.findById(newUser._id).select("-password")
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while creating the User.")
    }

    return res
        .status(201)
        .json({
            statusCode: 201,
            data: createdUser,
            message: "User registered Successfully."
        })
})

export { registerUser }