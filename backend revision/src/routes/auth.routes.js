import { Router } from "express";
import { login, register, profile } from "../controllers/auth.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.post("/register", register)
router.post("/login",login)
router.get("/profile",verifyJWT , profile)
export default router