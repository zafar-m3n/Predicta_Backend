const express = require("express");
const router = express.Router();

const { getDashboardStats } = require("../../controllers/admin/dashboardController");
const authenticate = require("../../middlewares/authMiddleware");
const authorizeRoles = require("../../middlewares/roleMiddleware");

// Protect all routes: must be admin
router.use(authenticate);
router.use(authorizeRoles("admin"));

// GET dashboard stats
router.get("/stats", getDashboardStats);

module.exports = router;
