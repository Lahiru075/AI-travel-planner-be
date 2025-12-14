import { Router } from "express";
import {  forgotPassword, getAllUsers, getMyDetails, googleLogin, handleRefreshToken, loginUser, registerUser, resetPassword } from "../controller/user.controller";
import { authenticate } from "../middleware/authenticate";
import { isAdmin } from "../middleware/isAdmin";
import { activateUser, suspendUser } from "../controller/user.controller";

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


export default routes;