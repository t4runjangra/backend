import {apiResponse} from "../utils/api-response.js"
import {asyncHandler} from "../utils/async-handler.js"


const healthCheck = asyncHandler(async (req, res) => {
    return res
    .status(200).json(
        new apiResponse((200), {message: "Health Check Passed"})
    )
})

export {healthCheck} 