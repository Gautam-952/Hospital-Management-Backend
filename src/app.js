import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.routes.js"
import doctorRouter from "./routes/doctor.routes.js"
import patientRouter from "./routes/patient.route.js"

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))

app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.json({ limit: "16kb" }))
app.use(cookieParser())
app.use(express.static("public"))
app.use("/api/v1/users", userRouter)
app.use("/api/v1/doctors", doctorRouter)
app.use("/api/v1/patient", patientRouter)

export { app }