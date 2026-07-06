import { User } from "../models/user.model.js";
import { apiError } from "../utils/api.error.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { uploadOnCloundinary } from "../utils/cloudinary.js";
import cloudinary from "cloudinary"
export const register = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body

    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) throw new apiError(409, "User already exist try other credentials")

    const user = await User.create({
        username,
        email,
        password
    })
    const createdUser = await User.findById(user._id).select("-password")
    if (!createdUser) {
        throw new apiError(500, "Something went wrong While regestirng a user");
    }

    return res.status(201).json(
        new apiResponse(201, { user: createdUser }, "user registered successfully")
    )
})

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body
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

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
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
            new apiResponse(200, { user: loggedInUser }, "User Logged in Successful")
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


export const updateAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new apiError(400, "Avatar file is required");
    }

    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
        throw new apiError(404, "User not found");
    }

    const oldPublicId = currentUser.avatar?.publicId;

    const uploadedAvatar = await uploadOnCloundinary(req.file.buffer);

    let updatedUser;

    try {
        updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    avatar: {
                        url: uploadedAvatar.url,
                        publicId: uploadedAvatar.publicId,
                    },
                },
            },
            {
                new: true,
                runValidators: true,
            }
        ).select("-password -refreshToken");

        if (!updatedUser) {
            throw new apiError(404, "User not found");
        }
    } catch (error) {
        try {
            await deleteFromCloudinary(uploadedAvatar.publicId);
        } catch (cleanupError) {
            console.error(
                "Failed to delete newly uploaded avatar after DB failure:",
                cleanupError
            );
        }

        throw error;
    }


    if (oldPublicId) {
        try {
            await deleteFromCloudinary(oldPublicId);
        } catch (cleanupError) {
            console.error(
                "Failed to delete old avatar:",
                cleanupError
            );
        }
    }

    return res.status(200).json(
        new apiResponse(
            200,
            updatedUser,
            "Avatar uploaded successfully"
        )
    );
});