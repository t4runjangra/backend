import {apiResponse} from "../utils/api-response.js"

const healthCheck = (req,res) =>{
    try {
        res.status(200).json(
            new apiResponse((200),{
                message:"Server is running"
            })
        )
    } catch (error) {

    }
}

export {healthCheck}