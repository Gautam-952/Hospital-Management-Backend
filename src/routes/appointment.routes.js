import { Router } from "express"
import { bookAppointment, getMyAppointment, getDoctorAppointment, updateAppointmentStatus } from "../controllers/appointment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/book-appointment").post(
    verifyJWT, bookAppointment
)

router.route("/get-appointment").get(
    verifyJWT, getMyAppointment
)

router.route("/get-doctor-appointment").get(
    verifyJWT, getDoctorAppointment
)

router.route("/status/:appointmentId").patch(
    verifyJWT, updateAppointmentStatus
)

export default router