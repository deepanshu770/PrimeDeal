import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import { getOwnerDashboard } from "../controller/admin.controller";

const router = Router();

// 🛡️ Protected route — Only logged-in owner can access
router.get("/dashboard", isAuthenticated, getOwnerDashboard);

export default router;
