import { User } from "../models/user-models.js";
import { asyncHandler } from "../utils/async-handler.js"
import { apiResponse } from "../utils/api-response.js"
import { apiError } from "../utils/api-error.js"



const registerUser = asyncHandler(async (req, res) => {

    console.log(req.body);

    // destructor the data of req.body 
    const { fullname, username, email, password } = req.body


    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    console.log("existedUser: ",existedUser);
    
    if (existedUser) {
        throw new apiError(409, "username or email already in use");
    }
    try {
        let user = User.create({
            fullname,
            username: username.toLowerCase(),
            email,
            password
        })

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
        if (!createdUser) {
            throw new apiError(500, "Something went wrong while registering user");
        }

    } catch (error) {
        console.log("User creation Failed !!", error);

    }
})


export {
    registerUser,
}