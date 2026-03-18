import type { Request, Response } from "express";
import { pool } from "../db.ts";

export const getRecentContributions = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.username, 
                fc.name as category, 
                c.amount, 
                TO_CHAR(c.created_at, 'YYYY-MM-DD HH24:MI') as "createdAt"
            FROM contributions c 
            JOIN users u ON c.user_id = u.id 
            JOIN funding_categories fc ON c.category_id = fc.id
            ORDER BY c.created_at DESC 
            LIMIT 1000;
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
                p.todo, 
                fc.name AS "areaOfInvestment"
            FROM open_problems p
            JOIN funding_categories fc ON p.category_id = fc.id
            ORDER BY p.created_at DESC
            LIMIT 50;
        `);
        res.json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
