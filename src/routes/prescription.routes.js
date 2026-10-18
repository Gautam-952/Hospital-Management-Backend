import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createPrescription, getPrescriptionByAppointment, getMyPrescriptions } from "../controllers/prescription.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/create").post(createPrescription);
router.route("/my-prescriptions").get(getMyPrescriptions);
router.route("/appointment/:appointmentId").get(getPrescriptionByAppointment);

export default router;