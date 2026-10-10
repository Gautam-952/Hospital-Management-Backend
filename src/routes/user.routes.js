import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser, loginUser, logoutUser, getCurrentUser, refreshAccessToken, changePassword, updateAccountDetails, updateAvatar } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.route("/register").post(
    upload.single("avatar"),
    registerUser
);

router.route("/login").post(
    loginUser
)

router.route("/logout").post(
    verifyJWT, logoutUser
)

router.route("/current-user").get(
    verifyJWT, getCurrentUser
)

router.route("/refresh-token").post(
    refreshAccessToken
)

router.route("/change-password").post(
    verifyJWT, changePassword
)

router.route("/update-details").post(
    verifyJWT, updateAccountDetails
)

router.route("/update-avatar").patch(
    verifyJWT, upload.single("avatar"), updateAvatar
)

export default router;