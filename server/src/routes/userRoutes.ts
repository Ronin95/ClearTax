import express from "express";
import { getMe, syncTaxes, increaseAvailableTax, contributeToDebt } from "../controllers/userController.ts";
import { verifyToken } from "../middleware/authMiddleware.ts";

const router = express.Router();

router.get("/me", verifyToken, getMe);

router.post("/sync-taxes", verifyToken, syncTaxes);

router.post("/increase-available-tax", verifyToken, increaseAvailableTax);

router.post("/contribute-debt", verifyToken, contributeToDebt);

export default router;