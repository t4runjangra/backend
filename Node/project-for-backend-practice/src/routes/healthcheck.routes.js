import Router from "express";
import { healthCheck } from "../controller/healthcheck.controllers.js";

const router = Router()

router.route("/").get(healthCheck)

export default router