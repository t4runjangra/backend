import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/async-handler.js";
import { apiError } from "../utils/api-error.js";
import { User } from "../models/user.models.js";


export const verifyJWT = asyncHandler(async (req, _, next) => {
    let token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer", "")
    if (!token) {
        throw new apiError(401, "Unauthorized");
    }
    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new apiError(401, "Unauthorized");
        }
        req.user = user


        next()

    } catch (error) {
        throw new apiError(401,error?.message || "Invalid access token");
    }
})