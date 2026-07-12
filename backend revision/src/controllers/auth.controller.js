import { User } from "../models/user.model.js";
import { apiError } from "../utils/api.error.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { uploadOnCloudinary, deleteFromCloudinary, uploadLocalFileToCloudinary } from "../utils/cloudinary.js";
import { genereateVerificationToken } from "../utils/generateVerificationToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto"
export const register = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body
    const { rawToken, hashedToken, expiry } = genereateVerificationToken()

    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) throw new apiError(409, "User already exist try other credentials")

    const verificationUrl =
        `${process.env.BACKEND_URL}/api/v1/auth/verify-email/${rawToken}`;

    const user = await User.create({
        username,
        email,
        password,


        isEmailVerified: false,
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: expiry

    })
    await sendEmail(
        user.email,
        "Verify your email",
        `
        <h2>Verify your email address</h2>
        <p>Click the link below to verify your account:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link expires in 30 minutes.</p>
    `
    );

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

    if (!user.isEmailVerified) {
        throw new apiError(
            403,
            "Please verify your email before logging in"
        );
    }
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
        .clearCookie("accessToken")
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

    const uploadedAvatar = await uploadOnCloudinary(req.file.buffer);
    // throw new Error("Forced DB failure");

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
                returnDocument: "after",
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


export const uploadCoverAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new apiError(400, "Cover file is required")
    }
    const currentUser = await User.findById(req.user.id)

    if (!currentUser) {
        throw new apiError(404, "User not found");
    }
    const oldPublicId = currentUser.coverAvatar?.publicId;

    const uploadedCoverAvatar = await uploadLocalFileToCloudinary(req.file.path)


    let updatedUser;
    try {
        updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    coverAvatar: {
                        url: uploadedCoverAvatar.url,
                        publicId: uploadedCoverAvatar.publicId,
                    },
                },
            },
            {
                returnDocument: "after",
                runValidators: true,
            }
        ).select("-password -refreshToken")

        if (!updatedUser) {
            throw new apiError(404, "User not found ")
        }

    } catch (error) {
        try {
            await deleteFromCloudinary(uploadedCoverAvatar.publicId);
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

    return res.status(200).json(new apiResponse(
        200,
        updatedUser,
        "Cover Avatar updated successfully"
    ))
})



export const verifyEmail = asyncHandler(async (req, res) => {
    const { rawToken } = req.params
    if (!rawToken) {
        throw new apiError(400, "Email token is required")
    }

    const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex")

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new apiError(400, "Token is invalid or expired");
    }

    user.emailVerificationToken = null
    user.emailVerificationExpiry = null
    user.isEmailVerified = true
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(
        new apiResponse(
            200,
            { isEmailVerified: true },
            "Email is verified"
        )
    )
})

export const resendEmail = asyncHandler(async (req, res) => {

    const { email } = req.body

    const user = await User.findOne({ email })

    if (!user || user.isEmailVerified) {
        return res.status(200)
            .json(
                new apiResponse(
                    200,
                    null,
                    "If an unverified account exists for this email, a verification email has been sent"
                ));
    }
    const { rawToken, hashedToken, expiry } = genereateVerificationToken()

    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = expiry

    const verificationUrl =
        `${process.env.BACKEND_URL}/api/v1/auth/verify-email/${rawToken}`;

    await user.save({ validateBeforeSave: false })
    await sendEmail(
        user.email,
        "Verify your email",
        `
        <h2>Verify your email address</h2>
        <p>Click the link below to verify your account:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link expires in 30 minutes.</p>
    `
    );
    await user.save({ validateBeforeSave: false })
    return res.status(200).json(
        new apiResponse(
            200,
            null,
            "If an unverified account exists for this email, a verification email has been sent"
        )
    )
})

export const forgetPassword = asyncHandler(async (req, res) => {
    const RESPONSE_MESSAGE = "If an account exists for this email, a password reset link has been sent";
    const { email } = req.body

    const user = await User.findOne({ email })

    if (!user) {
        return res.status(200).json(
            new apiResponse(200, null, RESPONSE_MESSAGE)
        );
    }

    const { rawToken, hashedToken, expiry } = genereateVerificationToken()

    const verificationUrl =
        `${process.env.BACKEND_URL}/api/v1/auth/reset-password/${rawToken}`;

    user.passwordResetToken = hashedToken
    user.passwordResetExpiry = expiry
    await user.save()
    await sendEmail(
        user.email,
        "Reset Your Password",
        `
    <h2>Password Reset Request</h2>
    <p>We received a request to reset the password for your account.</p>
    <p>Click the link below to set a new password:</p>
    
    <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">Reset Password</a>
    
    <p style="margin-top: 20px; font-size: 14px; color: #666;">
      Or copy and paste this link into your browser:<br>
      ${verificationUrl}
    </p>
    
    <p><strong>This link expires in 30 minutes.</strong></p>
    
    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
    
    <p style="font-size: 12px; color: #999;">
      Didn't request this? You can safely ignore this email. Your password will not be changed unless you click the link above.
    </p>
  `
    );

    return res.status(200).json(
        new apiResponse(200, null, "Forget Password link has been sent to your email address ")
    )
})


export const resetPassword = asyncHandler(async (req, res) => {
    const {  token: rawToken } = req.params
    if (!rawToken) {
        throw new apiError(400, "Email token is required")
    }
    const { newPassword } = req.body

    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex")
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpiry: { $gt: Date.now() }
    })
    if (!user) {
        throw new apiError(400, "Token is invalid or expired");
    }
    user.password = newPassword
    user.passwordResetToken = null
    user.passwordResetExpiry = null
    user.refreshToken = null
    await user.save()

    
    return res.status(200).json(
        new apiResponse(200, null, "Password reset successful")
    )
})