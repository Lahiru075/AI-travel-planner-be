import { Router } from "express";
import {  forgotPassword, getAllUsers, getMyDetails, googleLogin, handleRefreshToken, loginUser, registerUser, resetPassword, updateProfile } from "../controller/user.controller";
import { authenticate } from "../middleware/authenticate";
import { isAdmin } from "../middleware/isAdmin";
import { activateUser, suspendUser } from "../controller/user.controller";
import { upload } from "../middleware/upload";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google_login", googleLogin)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/refresh", handleRefreshToken)
router.get("/getMyDetails", authenticate, getMyDetails)
router.get("/all_users", authenticate, isAdmin, getAllUsers);
router.patch("/suspend_user/:id", authenticate, isAdmin, suspendUser);
router.patch("/activate_user/:id", authenticate, isAdmin, activateUser);
router.patch("/update_profile", authenticate, upload.single("image"), updateProfile);


export default router;