import { Router } from "express"
import { createPatient, getPatientProfile, updatePatientProfile } from "../controllers/patient.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/create-profile").post(
    verifyJWT, createPatient
)

router.route("/get-profile").get(
    verifyJWT, getPatientProfile
)

router.route("/update-profile").patch(
    verifyJWT, updatePatientProfile
)

export default router