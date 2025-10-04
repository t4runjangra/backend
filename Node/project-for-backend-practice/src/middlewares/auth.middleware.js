import { User } from "../models/user-models.js"
import { apiError } from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js"
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new apiError(401, "Unauthorized request");
    }

    try {
        const decoderToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decoderToken?._id).select(
            "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
        )
        if (!user) {

            throw new apiError(401, "Invalid accesss token");
        }
        req.user = user
        next()

    } catch (error) {
        console.log("JWT error:", error.message);
        throw new apiError(401, "Invalid access token");

    }
})