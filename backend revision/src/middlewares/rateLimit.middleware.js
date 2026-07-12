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


const resetPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Too many password reset attempts, please try again in an hour.',
    standardHeaders: true,
    legacyHeaders: false,
});


export { resendEmailVerificationLimiter, resetPasswordLimiter }


