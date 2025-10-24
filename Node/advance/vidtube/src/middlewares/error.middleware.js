import mongoose from "mongoose";
import { apiError } from "../utils/api-error.js";


const errorHandler = (err, req, res, next) => {
    let error = err
    if (!(err instanceof apiError)) {
        const statusCode = error.statusCode || error instanceof mongoose.Error ? 400 : 500

        const message = error.message || "Something went wrong "
        error = new apiError(statusCode, message, error?.errors || [], err.stack)
    }

    const response = {
        ...error,
        message: error.message,
        ...(process.env.NODE_ENV) === "development" ? {
            stack: error.stack}:{}
    }
}

export { errorHandler }
