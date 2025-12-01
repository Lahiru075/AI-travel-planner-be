import { Router } from "express";
import { getMyDetails, googleLogin, handleRefreshToken, loginUser, registerUser } from "../controller/user.controller";
import { authenticate } from "../middleware/authenticate";

const routes = Router();

routes.post("/register", registerUser);
routes.post("/login", loginUser);
routes.post("/google_login", googleLogin)
routes.post("/refresh", handleRefreshToken)
routes.get("/getMyDetails", authenticate, getMyDetails)

export default routes;