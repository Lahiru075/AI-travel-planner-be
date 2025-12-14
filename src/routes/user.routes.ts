import { Router } from "express";
import {  forgotPassword, getAllUsers, getMyDetails, googleLogin, handleRefreshToken, loginUser, registerUser, resetPassword, updateProfile } from "../controller/user.controller";
import { authenticate } from "../middleware/authenticate";
import { isAdmin } from "../middleware/isAdmin";
import { activateUser, suspendUser } from "../controller/user.controller";
import { upload } from "../middleware/upload";

const routes = Router();

routes.post("/register", registerUser);
routes.post("/login", loginUser);
routes.post("/google_login", googleLogin)
routes.post("/forgot-password", forgotPassword);
routes.post("/reset-password/:token", resetPassword);
routes.post("/refresh", handleRefreshToken)
routes.get("/getMyDetails", authenticate, getMyDetails)
routes.get("/all_users", authenticate, isAdmin, getAllUsers);
routes.patch("/suspend_user/:id", authenticate, isAdmin, suspendUser);
routes.patch("/activate_user/:id", authenticate, isAdmin, activateUser);
routes.patch("/update_profile", authenticate, upload.single("image"), updateProfile);


export default routes;