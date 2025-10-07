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

const userLoginValidator = () => {
    return [
        body("email")
            .optional()
            .isEmail().
            withMessage("Email is invalid"),

        body("password")
            .notEmpty()
            .withMessage("Passwird is required")
    ]
}

const userChangeCurrentPasswordValidator = () => {
    return [
        body("oldPassword").notEmpty().withMessage("Old Password is required"),
        body("newPassword").notEmpty().withMessage("New Password is required")
    ]
}

const userForgotPasswordValidator = () => {

    return [
        body("email")
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid")
    ]
}

const userResetForgotPasswordValidator = () => {
    return [
        body("newPassword")
            .notEmpty()
            .withMessage("Password is required")
    ]
}

export {
    userRegisterValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator
}