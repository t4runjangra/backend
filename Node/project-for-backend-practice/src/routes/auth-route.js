import Router from "express";
import { login, registerUser, logout } from "../controller/auth-controller.js"
import { validate } from "../middlewares/vaildate-middleware.js"
import { userLoginValidator, userRegisterValidator } from "../validators/index.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(userRegisterValidator(), validate, registerUser);

router.route("/login").post(userLoginValidator(), validate, login);

router.route("/logout").post(verifyJWT, logout);


export default router