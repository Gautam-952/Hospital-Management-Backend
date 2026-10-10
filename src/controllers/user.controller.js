import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { set } from "mongoose";
import jwt from "jsonwebtoken"

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

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong while generating token.")
    }
}

const loginUser = asyncHandler(async (req, res) => {
    const { email, userName, password } = req.body

    if (!(userName || email)) {
        throw new ApiError(400, "All credentials should be filled.")
    }

    if (!password) {
        throw new ApiError(400, "Password is required.")
    }

    const alreadyUser = await User.findOne({ $or: [{ userName }, { email }] })
    if (!alreadyUser) {
        throw new ApiError(404, "User does not exsist.")
    }
    const isPasswordValid = await alreadyUser.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials.")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(alreadyUser._id)

    const loggedInUser = await User.findById(alreadyUser._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
            statusCode: 200,
            data: {
                user: loggedInUser,
            },
            message: "User logged in successfully."
        })

    return res

})

const logoutUser = asyncHandler(async (req, res) => {
    const loggoutUser = await User.findByIdAndUpdate(req.user._id,
        {
            set: {
                refreshToken: 1 // or $unset: {refreshToken : 1} or refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({
            statusCode: 200,
            data: {},
            message: "User Logged Out Succesfully."
        })
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json({
            statusCode: 200,
            data: req.user,
            message: "Current User Fetched Successfully."
        })
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request , Refresh Token Missing.")
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const ourUser = await User.findById(decodedToken?._id)

    if (!ourUser) {
        throw new ApiError(401, "Invalid refresh Token.")
    }
    if (ourUser.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is expired or used.")
    }

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(ourUser._id)

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .cookie("refreshToken", newRefreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json({
            statusCode: 200,
            data: {
                accessToken,
                refreshToken: newRefreshToken
            },
            message: "Refresh Token refreshed successfully."
        })

})


const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user?._id)
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Both old Password and new password is required.")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json({
            statusCode: 200,
            data: {},
            message: "Password changed successfully."
        })
})

export { registerUser, loginUser, logoutUser, getCurrentUser, refreshAccessToken, changePassword }