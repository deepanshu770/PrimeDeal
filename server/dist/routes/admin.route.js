"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const isAuthenticated_1 = require("../middlewares/isAuthenticated");
const admin_controller_1 = require("../controller/admin.controller");
const router = (0, express_1.Router)();
// 🛡️ Protected route — Only logged-in owner can access
router.get("/dashboard", isAuthenticated_1.isAuthenticated, admin_controller_1.getOwnerDashboard);
exports.default = router;
