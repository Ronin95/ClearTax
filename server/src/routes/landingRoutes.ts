import express from "express";
import { 
    getRecentContributions, 
    getPieChartData, 
    getOpenProblems 
} from "../controllers/landingController.ts";

const router = express.Router();

router.get("/contributions", getRecentContributions);
router.get("/pieChart", getPieChartData);
router.get("/openProblems", getOpenProblems);

export default router;
