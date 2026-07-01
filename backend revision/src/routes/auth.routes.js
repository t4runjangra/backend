import { Router } from "express";
import { login, register, profile } from "../controllers/auth.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const authRouter = Router()

authRouter.post("/register", register)
authRouter.post("/login",login)
authRouter.get("/profile",verifyJWT , profile)
export default authRouter