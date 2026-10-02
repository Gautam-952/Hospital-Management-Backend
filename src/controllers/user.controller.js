import User from "./models/user.models.js";
import apiError from "./utils/apiError.js";
import uploadToCloudinary from "./utils/cloudinary.js";
import asyncHandler from "./utils/asyncHandler.js";
import { response } from "express";

const registeredUser = asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body

    if (!username || !email || !password || !role) {
        throw new apiError(400, "All credentials should be filled.")
    }

    const exsistedUser = await User.findOne({ $or: [{ email }, { username }] })
    if (exsistedUser) {
        throw new apiError(409, "User already exsists.")
    }

    const localPathUrl = req.file?.path
    if (!localPathUrl) {
        throw new apiError(400, "Avatar file is required.")
    }
    const avatar = await uploadToCloudinary(localPathUrl)

    const newUser = await User.create({
        username,
        email,
        password,
        role,
        avatar: avatar.url,
    })

    return response
        .status(201)
        .json({
            statusCode: 201,
            data: newUser,
            message: "User registered Successfully."
        })
})

export { registeredUser }