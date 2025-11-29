import { Router } from "express";
import { deleteTrip, generateTrip, getMyTrips, getPlaceImage, getTripById, getWeatherInfo, saveTrip } from "../controller/trip.controller";
import { authenticate } from "../middleware/authenticate";

const routes = Router();

routes.post("/generate", authenticate, generateTrip)
routes.post("/save", authenticate, saveTrip)
routes.get("/mytrips", authenticate, getMyTrips)
routes.delete("/delete/:id", authenticate, deleteTrip)
routes.get("/viewtrip/:id", authenticate, getTripById)
routes.post("/getimage", authenticate, getPlaceImage);
routes.post("/get_weather", authenticate, getWeatherInfo);

export default routes;