import { asyncHandler } from "../utils/async-handler.js";
import { apiError } from "../utils/api-error.js"
import { apiResponse } from "../utils/api-response.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary} from "../utils/cloudinary.utils.js"

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body

    //validation 
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required")
    }
    
    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })
    if (existedUser) {
        throw new apiError(409, "User with email or usename already exists")
    }
    
    const avatarLocalPath = req.file?.avatar[0]?.path
    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is missing")        
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    
    let coverImage = ""
    const coverLocalPath = req.file?.coverImage[0]?.path
    
    if (coverLocalPath) {
        coverImage = await uploadOnCloudinary(coverLocalPath)
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken "
    )
    if(!createdUser){
        throw new apiError(500, "Something went Wrong!! while registering a user")
    }

    return res.status(201).json(new apiResponse(200, createdUser , "User registered successfully!  "))
})







export {
    registerUser
}