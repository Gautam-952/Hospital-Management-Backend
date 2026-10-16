import { Router } from "express"
import { createDoctorProfile, getDoctorProfile } from "../controllers/doctor.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/create-profile").post(
    verifyJWT, createDoctorProfile
)

router.route("/profile").get(
    verifyJWT, getDoctorProfile
)

router.route("/:id").get(
    getDoctorProfile
)

export default router