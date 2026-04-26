import type { Response } from "express";
import { pool } from "../db.ts";
import type { AuthRequest } from "../middleware/authMiddleware.ts";

export const getMe = async (req: AuthRequest, res: Response) => {
    // We send back req.user which was populated by the verifyToken middleware
    return res.json({ user: req.user });
};

export const syncTaxes = async (req: AuthRequest, res: Response) => {
    try {
        // Use the amount sent from the frontend
        const { amountToAdd } = req.body;
        const userId = req.user?.id;

        if (!amountToAdd || amountToAdd <= 0) {
            return res.status(400).json({ error: "Invalid amount provided." });
        }

        // Update the database and RETURN the new value immediately
        const result = await pool.query(
            `UPDATE users 
             SET available_amount = available_amount + $1 
             WHERE id = $2 
             RETURNING available_amount`,
            [amountToAdd, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }

        // Send the real database total back to the frontend
        return res.json({ 
            newBalance: result.rows[0].available_amount 
        });

    } catch (error) {
        console.error("Sync Error:", error);
        return res.status(500).json({ error: "Database sync failed." });
    }
};

export const increaseAvailableTax = async (req: AuthRequest, res: Response) => {
    try {
        const { amount } = req.body;
        const userId = req.user?.id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Invalid amount provided." });
        }

        const result = await pool.query(
            `UPDATE users 
             SET available_amount = available_amount + $1 
             WHERE id = $2 
             RETURNING available_amount`,
            [amount, userId]
        );

        return res.json({ 
            message: "Tax amount successfully updated.",
            newBalance: result.rows[0].available_amount 
        });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error." });
    }
};