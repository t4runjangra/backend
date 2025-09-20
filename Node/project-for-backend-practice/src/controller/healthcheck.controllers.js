import {apiResponse} from "../utils/api-response.js"
import {asyncHandler} from "../utils/async-handler.js"

// so this is also a method of writing this request handling code but here i have to explecitly handle the error on its own and it gets messy and will make the code complex  so i used a higher order function on my utils folder where i make a high order function which take function as a input and returns a funciton 


// const healthCheck = (req,res) =>{
//     try {
//         res.status(200).json(
//             new apiResponse((200),{
//                 message:"Server is running"
//             })
//         )
//     } catch (error) {

//     }
// }

const healthCheck = asyncHandler(async (req, res) => {
    res
    .status(200).json(
        new apiResponse((200), {message: "Server is running"})
    )
})

export {healthCheck}