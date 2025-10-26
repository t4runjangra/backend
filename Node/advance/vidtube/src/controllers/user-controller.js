import { asyncHandler } from "../utils/async-handler.js";
import { apiError } from "../utils/api-error.js"
import { apiResponse } from "../utils/api-response.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.utils.js"

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
        throw new apiError(404 , "User with email or usename already exists")
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
    
    
    
})

export {
    registerUser
}