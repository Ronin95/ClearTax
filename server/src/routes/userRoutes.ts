import express from "express";
import { getMe, syncTaxes, increaseAvailableTax } from "../controllers/userController.ts";
import { verifyToken } from "../middleware/authMiddleware.ts";

const router = express.Router();

router.get("/me", verifyToken, getMe);

router.post("/sync-taxes", verifyToken, syncTaxes);

router.post("/increase-available-tax", verifyToken, increaseAvailableTax);

export default router;