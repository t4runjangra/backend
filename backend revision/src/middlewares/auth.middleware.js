import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const verifyJWT = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "")
    if (!token) return res.status(401).json({ message: "Unauthorized request" });
    try {
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodeToken?.id).select(
            "-password -refreshToken"
        )
        if (!user) return res.status(401).json({
            message: "Unauthorized request Invalid accesss token"
        })
        req.user = user
        next()
    } catch (error) {
        console.log("JWT ERROR: ", error.message)
        return res.status(401).json({
            message: "Invalid access token"
        })
    }
}
