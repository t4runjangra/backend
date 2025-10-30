import { asyncHandler } from "../utils/async-handler.js";
import { apiError } from "../utils/api-error.js"
import { apiResponse } from "../utils/api-response.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.utils.js"
import jwt from "jsonwebtoken";






const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        if (!user) {
            console.log("User Not found")
            process.exit(1)
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new apiError(500, "Something went wrong while generating the access Token and refresh Token ", error);

    }
}


const registerUser = asyncHandler(async (req, res) => {

    console.log('BODY:', req.body);
    console.log('FILES:', req.files);

    const { fullName, email, username, password } = req.body

    //validation 
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new apiError(400, "All fields are required")
    }

    console.log("Trying to find", { username, email });
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    console.log("Found:", existedUser);

    if (existedUser) {
        console.log("here");
        console.error("user Exist")
        throw new apiError(404, "User with email or usename already exists")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverLocalPath = req.files?.coverImage?.[0]?.path;
    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is missing")
    }

    // const avatar = await uploadOnCloudinary(avatarLocalPath)
    // let coverImage = ""
    // if (coverLocalPath) {
    //     coverImage = await uploadOnCloudinary(coverLocalPath)
    // }

    let avatar;
    try {
        console.log("Uploading avatar to Cloudinary...");
        avatar = await uploadOnCloudinary(avatarLocalPath)
        console.log("Avatar upload finished");

    } catch (error) {
        console.log("error uploading the file ", error);
        throw new apiError(500, "Error uploading avatar");
    }

    let coverImage;
    try {
        coverImage = await uploadOnCloudinary(coverLocalPath)
    } catch (error) {
        console.log("error uploading the file ", error);
        throw new apiError(500, "Error uploading Cover Image");
    }

    try {
        const user = await User.create({
            fullName,
            username: username.toLowerCase(),
            email,
            password,
            avatar: avatar.url,
            // coverImage: coverImage?.url || "",
        })

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken "
        )
        console.log(createdUser);

        if (!createdUser) {
            throw new apiError(500, "Something went Wrong!! while registering a user")
        }

        return res.status(201).json(new apiResponse(200, createdUser, "User registered successfully!  "))
    }
    catch (error) {
        console.log("User creation is failed", error);

        if (avatar) {
            await deleteFromCloudinary(avatar.public_id)
        }
        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id)
        }

        throw new apiError(500, "Something went wrong while registering a user and deleted the image");

    }



})


const login = asyncHandler(async (req, res) => {

    const { email, password } = req.body

    if (!email) {
        throw new apiError(404, "Email is required");
    }

    const user = await User.findOne({ email })
    if (!user) {
        throw new apiError(404, "User Not found");

    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)
    if (!isPasswordCorrect) {
        throw new apiError(401, " Invalid Creds");
    }


    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    if (!loggedInUser) {
        throw new apiError(404, "Error in log in ", error);
    }

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development"
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new apiResponse(
            200,
            { user: loggedInUser, accessToken, refreshToken },
            "User Logged in successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new apiError(401, "Refresh Token is required");
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        )
        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new apiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken != user.refreshToken) {
            throw new apiError(401, "Invalid refresh token");
        }
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "development"
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new apiResponse(
                200,
                { accessToken, refreshToken: newRefreshToken },
                "Access Token refreshed successfully"
            ))


    } catch (error) {
        console.log("Error In refreshAccessToken Block", error)
        throw new apiError(500, "Something went wrong while refreshing the token");

    }
})


const logout = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        }, { new: true }
    )
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development"
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, {}, "User logged out successfully"))


})


export {
    registerUser,
    login,
    logout,
    refreshAccessToken
}