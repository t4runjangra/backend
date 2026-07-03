import { User } from "../models/user.model.js";
import { apiError } from "../utils/api.error.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const register = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body
    if (!email || !password || !username) throw new apiError(400, "All fields are required ")

    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) throw new apiError(409, "User already exist try other credentials")

    const user = await User.create({
        username,
        email,
        password
    })


    return res.status(201).json(
        new apiResponse(201, user, "user registered successfully")
    )
})

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) throw new apiError(400, "All fields required for login")
    const user = await User.findOne({ email })
    if (!user) throw new apiError(404, "Not Found User does not exist")
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) throw new apiError(401, "Invalid credentials")

    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    user.refreshToken = refreshToken;

    await user.save({
        validateBeforeSave: false
    });
    const options = {
        httpOnly: true,
        secure: false,
        sameSite: "strict"
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(200, { user }, "User Logged in Successful")
        )
})


export const profile = asyncHandler((req, res) => {
    return res.status(200).json(new apiResponse(200, req.user, "Profile Fetched successfully"))
})



export const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user.id, {
        $set: {
            refreshToken: ""
        }
    })
    return res.status(200)
        .clearCookie("refreshToken")
        .json(
            new apiResponse(200, null, "User logged out Successfully")
        )
})

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
        throw new apiError(401, "Refresh token missing")
    }
    const verifiedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

    const decodedID = verifiedRefreshToken.id

    const user = await User.findById(decodedID)
    if (!user) {
        throw new apiError(404, "User not found")
    }
    if (refreshToken !== user.refreshToken) {
        throw new apiError(401, "Invalid Refresh Token");
    }
    const newAccessToken = await user.generateAccessToken()
    const newRefreshToken = await user.generateRefreshToken()
    user.refreshToken = newRefreshToken

    await user.save({
        validateBeforeSave: false
    })
    const options = {
        httpOnly: true,
        secure: false,
        sameSite: "strict"
    }
    return res
        .status(200)
        .cookie("accessToken", newAccessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new apiResponse(
            200,
            {},
            "Access token refreshed successfully"
        ))
})
