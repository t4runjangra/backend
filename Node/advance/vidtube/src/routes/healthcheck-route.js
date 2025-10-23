import Router from "express";
import { healthCheck } from "../controllers/healthcheck-controller.js";
import {upload} from "../middlewares/multer.middleware.js"
const router = Router()


//   /api/v1/healthcheck
router.route("/").get(upload.single(avatar),healthCheck)
router.route("/test").get(healthCheck)

export default router