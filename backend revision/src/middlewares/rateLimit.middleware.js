import { rateLimit } from "express-rate-limit"

const resendEmailVerificationLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        statusCode: 429,
        message: "Too many verification email requests. Please try again later."
    }
})

export { resendEmailVerificationLimiter }