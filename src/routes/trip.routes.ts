import { Router } from "express";
import { cloneTrip, deleteTrip, generateTrip, getAllTrips, getMyTrips, getPlaceImage, getPublicTrips, getTripById, getWeatherInfo, saveTrip, togglePublicStatus } from "../controller/trip.controller";
import { authenticate } from "../middleware/authenticate";
import { isAdmin } from "../middleware/isAdmin";

const routes = Router();

routes.post("/generate", authenticate, generateTrip)
routes.post("/save", authenticate, saveTrip)
routes.get("/mytrips", authenticate, getMyTrips)
routes.delete("/delete/:id", authenticate, deleteTrip)
routes.get("/viewtrip/:id", authenticate, getTripById)
routes.post("/getimage", authenticate, getPlaceImage);
routes.post("/get_weather", authenticate, getWeatherInfo);
routes.get("/all_trips", authenticate, isAdmin, getAllTrips);
routes.patch("/publish/:id", authenticate, togglePublicStatus);
routes.get("/public-trips/", authenticate, getPublicTrips);
routes.post("/clone/:id", authenticate, cloneTrip);

export default routes;