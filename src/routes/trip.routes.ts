import { Router } from "express";
import { generateTrip } from "../controller/trip.controller";
import { authenticate } from "../middleware/authenticate";

const routes = Router();

routes.post("/generate", authenticate, generateTrip)

export default routes;