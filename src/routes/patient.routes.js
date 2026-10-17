import { Router } from "express"
import { createPatient, getPatientProfile } from "../controllers/patient.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/create-profile").post(
    verifyJWT, createPatient
)

router.route("/get-profile").get(
    verifyJWT, getPatientProfile
)

export default router