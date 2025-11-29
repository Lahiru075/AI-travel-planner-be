import { Router } from "express";
import { activateUser, getAllTrips, getAllUsers, getDashboardStats, suspendUser } from "../controller/admin.controller";
import { isAdmin } from "../middleware/isAdmin";
import { authenticate } from "../middleware/authenticate";
import { deleteTrip } from "../controller/trip.controller";

const routes = Router();

routes.get("/dashboard_stats", authenticate, isAdmin, getDashboardStats);
routes.get("/all_users", authenticate, isAdmin, getAllUsers);
routes.get("/all_trips", authenticate, isAdmin, getAllTrips);
routes.patch("/suspend_user/:id", authenticate, isAdmin, suspendUser);
routes.patch("/activate_user/:id", authenticate, isAdmin, activateUser);
routes.delete("/delete/:id", authenticate, isAdmin, deleteTrip);

export default routes;