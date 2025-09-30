import { validationResult } from "express-validator";
import { apiError } from "../utils/api-error.js"

export const validate = (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next()
    }
    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push(
        {
            [err.path]: err.msg
        }
    ))
    throw new apiError(422, "Recieved data is not valid", extractedErrors)
}