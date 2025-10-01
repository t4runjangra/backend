import Router from "express";
import { login, registerUser } from "../controller/auth-controller.js"
import { validate } from "../middlewares/vaildate-middleware.js"
import { userLoginValidator, userRegisterValidator } from "../validators/index.js"
const router = Router()

router.route("/register").post(userRegisterValidator(), validate, registerUser);

router.route("/login").post(userLoginValidator(),validate,login);
export default router