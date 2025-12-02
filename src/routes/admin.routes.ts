import { Router } from "express";
import { getDashboardStats } from "../controller/admin.controller";
import { isAdmin } from "../middleware/isAdmin";
import { authenticate } from "../middleware/authenticate";

const routes = Router();

routes.get("/dashboard_stats", authenticate, isAdmin, getDashboardStats);

export default routes;