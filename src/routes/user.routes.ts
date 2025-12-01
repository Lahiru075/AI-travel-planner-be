import { Router } from "express";
import { forgotPassword, getMyDetails, googleLogin, handleRefreshToken, loginUser, registerUser, resetPassword } from "../controller/user.controller";
import { authenticate } from "../middleware/authenticate";

const routes = Router();

routes.post("/register", registerUser);
routes.post("/login", loginUser);
routes.post("/google_login", googleLogin)
routes.post("/forgot-password", forgotPassword);
routes.post("/reset-password/:token", resetPassword);
routes.post("/refresh", handleRefreshToken)
routes.get("/getMyDetails", authenticate, getMyDetails)


export default routes;