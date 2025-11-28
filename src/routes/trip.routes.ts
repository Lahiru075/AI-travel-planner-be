import { Router } from "express";
import { deleteTrip, generateTrip, getMyTrips, getPlaceImage, getTripById, saveTrip } from "../controller/trip.controller";
import { authenticate } from "../middleware/authenticate";

const routes = Router();

routes.post("/generate", authenticate, generateTrip)
routes.post("/save", authenticate, saveTrip)
routes.get("/mytrips", authenticate, getMyTrips)
routes.delete("/delete/:id", authenticate, deleteTrip)
routes.get("/viewtrip/:id", authenticate, getTripById)
routes.post("/getimage", authenticate, getPlaceImage);

export default routes;