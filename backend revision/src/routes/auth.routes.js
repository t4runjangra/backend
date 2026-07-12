import { Router } from "express";
import { login, register, profile, updateAvatar, uploadCoverAvatar, logout } from "../controllers/auth.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { upload } from "../middlewares/multer.middlewar.js";
import { diskUpload } from "../middlewares/multer.disk.middleware.js";
import { verifyEmail } from "../controllers/auth.controller.js";
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

authRouter.patch(
    "/cover-avatar",
    verifyJWT,
    diskUpload.single("cover-avatar"),
    uploadCoverAvatar
)
authRouter.get("/verify-email/:rawToken", verifyEmail)
authRouter.post("/logout", verifyJWT, logout)
export default authRouter