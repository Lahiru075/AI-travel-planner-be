import { Router } from "express";
import { loginUser, registerUser } from "../controller/user.controller";
import { authenticate } from "../middleware/authenticate";

const routes = Router();

routes.post("/register", registerUser);
routes.post("/login", loginUser);

export default routes;