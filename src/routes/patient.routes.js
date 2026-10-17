import { Router } from "express"
import { createPatient } from "../controllers/patient.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/create-profile").post(
    verifyJWT, createPatient
)

export default router