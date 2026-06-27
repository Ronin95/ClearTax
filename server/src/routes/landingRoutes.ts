import express from "express";
import { 
    getRecentContributions, 
    getPieChartData, 
    getOpenProblems, 
    getDebtStats
} from "../controllers/landingController.ts";

const router = express.Router();

router.get("/contributions", getRecentContributions);
router.get("/pieChart", getPieChartData);
router.get("/openProblems", getOpenProblems);
router.get("/debt-stats", getDebtStats);

export default router;
