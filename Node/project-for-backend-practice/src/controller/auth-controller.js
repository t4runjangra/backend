/* so this is a authentication file for user registration here i authenticate user 
    1> take some  user data  
    2> validate will do it after sometime
    3> check the database if the user already exist or not
    4> save new user
    5> user verification through email
*/


// imported files for this use case 

import { User } from "../models/user-models.js"
import { apiResponse } from "../utils/api-response.js";
import { apiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail, emailVerificationMailgenContent } from "../utils/mail.js";

const generateAccesstokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return ({ accessToken, refreshToken })
    }
    catch (error) {
        throw new apiError(500, "Something went wrong while generaating access token ");

    }
}

// created a var names registerUser which use the asyncHandler module (nothing just a high order function which resolves a promise) which is a method takes a function as a parameter(high order function) 

// the async arrow function we have two parameters req(request), res(response) 
const registerUser = asyncHandler(async (req, res) => {

    // we can recieve the data in multiple ways like in the form of header or in the form of body or in params too i used body here because we assumed here that the data will come in the form of body 

    // destructurised the variables assumed that these credentials user will provide
    const { email, username, password, role } = req.body


    //User is the module here and .findOne is a method of mongoDB to find the existed User
    const existedUser = await User.findOne({
        // here $or is a logical or query operator of mongoDB  used for logical or operations 
        $or: [{ username }, { email }]
    })
    // logic behind this is to check either the username or the email provided exists in database or not if so it will assigned to the existedUser variable. This is a database call so that is why we use the await (the database is in other continent)  

    // simple logic if there is any user already exist throw an error  
    if (existedUser) {
        throw new apiError(409, "User already existed with the following username or credentials", []);
    }

    // if the credentials does not match the data base hence it will create a new user

    // here we created a user which is assigned to a database call (that's why we used the await (database is in other continent so it will take time to came)). the User is the model Modules i created in user-modules.js. This database call have a .create method (in-Built provided by mongoose) which creates a new user in the database. Since this is a mathod it will take what we need from the user as mentioned Email, username, Password. 
    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false
    })

    // after creating user we need to generate tokens as well here we assigned the temporary token to the user

    // destructureise the variables 
    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken() // generateTemporaryToken() defined in the user-models.js 

    user.emailVerificationToken = hashedToken // assigned the hased token to the property of user named emailverificationToken 
    user.emailVerificationExpiry = tokenExpiry// assigned the tokenExpiry (means it will expire after the assigned time) to the property of user named emailverificationToken 


    //after creating the user we need to save it to the database as well. here Used .save() method here which will save the user info to the database( used await because of the db call) 

    //By default, before saving, Mongoose validates the document against the defined schema.That's why we used the validateBeforeSave:false to skip that part ( disables this validation step, so the document is saved without checking if it passes schema validation.) 

    //This can be useful if manual validation has been done or if you want to bypass certain validation rules temporarily.
    await user.save({ validateBeforeSave: false })

    //after the successful registration we need to send the mail too    
    // used await because will wait till the user register and the token are assigned 

    // user data we need to provide to the sendEmail Modules to send it to the user 
    await sendEmail({
        email: user?.email, // user.email (?. is a optional chaining operator in js introduced after ES2020 it will check if the value is null or undefined. If it is neither null nor undefined, it accesses the next property, method, or element. If it is null or undefined, it returns undefined immediately without throwing a runtime error)
        subject: "please verify your email",
        mailgenContent: emailVerificationMailgenContent( // the emailVerificationMailgenContent method take two param (username and a verificationUrl)

            user.username, // username

            // a bit tricky tp understand first we will 
            // Constructs a full URL string to verify a user's email.
            // Uses the request's protocol (http or https) + the request's host (domain and port).
            // Appends the API endpoint path for email verification with the unhashed token at the end.
            // Example output: "https://example.com/api/v1/users/verify-email/12345token"

            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
        )

    })

    // the user is now created await the db call that will select the id of the user and select (which things the db should not include)

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )
    if (!createdUser) {
        throw new apiError(500, "Something went wrong While regestirng a user");
    }
    // return a response with a status code and a json with the new apiResponse 
    return res.status(201).json(
        new apiResponse(
            200,
            { user: createdUser },
            "User registerd successfully and verification email has been sent on your email"
        )
    )
})

// can be used in other folders as well 
export { registerUser };