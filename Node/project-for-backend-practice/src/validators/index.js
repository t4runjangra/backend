import { body } from "express-validator";

const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is Required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLowercase()
            .withMessage("Username must be in lower case")
            .isLength({ min: 4 })
            .withMessage("Username must be at least three Character long"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is Required")
            .isLength({ min: 4 })
            .withMessage("Password must contain 4 character"),
    ]
}

export {
    userRegisterValidator
}