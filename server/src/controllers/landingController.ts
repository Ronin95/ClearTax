import type { Request, Response } from "express";
import { pool } from "../db.ts";

export const getRecentContributions = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT u.username, fc.name as category, c.contributed_amount_by_user as amount, c.created_at
            FROM contributions c 
            JOIN users u ON c.user_id = u.id 
            JOIN funding_categories fc ON c.category_id = fc.id
            ORDER BY c.created_at DESC LIMIT 1000;
        `);

        const data = result.rows.map((row: any) => ({
            username: row.username || "Unknown",
            category: row.category || "General",
            amount: parseFloat(row.amount).toFixed(2),
            createdAt: row.created_at
        }));

        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getPieChartData = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                fc.id, 
                fc.name AS label, 
                COUNT(c.id)::int AS value
            FROM funding_categories fc
            LEFT JOIN contributions c ON fc.id = c.category_id
            GROUP BY fc.id, fc.name
            ORDER BY fc.id ASC;
        `);
        res.json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getOpenProblems = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                op.project_name AS todo,
                fc.name AS "areaOfInvestment"
            FROM open_problems op
            LEFT JOIN funding_categories fc ON op.category_id = fc.id
            ORDER BY RANDOM()
            LIMIT 10;
        `);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching open problems:", error);
        res.status(500).json({ error: "Failed to fetch open problems" });
    }
};

export const getDebtStats = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                COUNT(DISTINCT user_id)::int AS "number_of_people", 
                COALESCE(SUM(contributed_amount_by_user), 0)::float AS "amount_paid"
            FROM contributions
            WHERE category_id = (SELECT id FROM funding_categories WHERE name = 'Debt Repayment')
        `);

        // Log the result to the Docker console so you can verify it
        console.log("Debt Stats Fetched:", result.rows[0]);

        res.json(result.rows[0]);
    } catch (error: any) {
        console.error("Error in getDebtStats:", error.message);
        res.status(500).json({ error: error.message });
    }
};
