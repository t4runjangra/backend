import { Router } from "express";
import { login, register, profile, updateAvatar } from "../controllers/auth.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { upload } from "../middlewares/multer.middlewar.js";

const authRouter = Router()

authRouter.post("/register", validate(registerSchema), register)
authRouter.post("/login", validate(loginSchema), login)
authRouter.get("/profile", verifyJWT, profile)

authRouter.patch(
    "/avatar",
    verifyJWT,
    upload.single("avatar"),
    updateAvatar
);
export default authRouter