import { Router } from "express"
import { createDoctorProfile, getDoctorProfile, getAllDoctor } from "../controllers/doctor.controller.js"
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

router.route("/").get(
    getAllDoctor
)

export default router