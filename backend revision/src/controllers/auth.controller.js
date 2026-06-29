import { User } from "../models/user.model.js";
export const register = async (req, res, next) => {
    const { email, password, username } = req.body
    if (!email || !password || !username) return res.status(400).json({
        message: "All fields are required "
    })
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
        return res.status(409).json({ message: "User already exist try other credentials" })
    }
    const user = await User.create({
        username,
        email,
        password
    })


    return res.status(201).json({ message: "user registered successfully" })

}

export const login = async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) return res.status(401).json({ message: "Email required for login" })
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: "User does noe exist " });
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()
    user.refreshToken = refreshToken;
    await user.save();
    return res
        .status(200)
        .json({
            message: "User Logged in Successful",
            accessToken,
            refreshToken
        }
        )

}