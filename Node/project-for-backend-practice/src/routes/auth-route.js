import Router from "express";
import { registerUser } from "../controller/auth-controller.js"
import { validate } from "../middlewares/vaildate-middleware.js"
import { userRegisterValidator } from "../validators/index.js"
const router = Router()

router.route("/register").post(userRegisterValidator(), validate, registerUser);

export default router