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

export const contributeToDebt = async (req: AuthRequest, res: Response) => {
    // Destructure amount from the parsed body
    const { amount } = req.body; 
    const userId = req.user?.id;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid contribution amount" });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Fetch current balance
        const userRes = await client.query('SELECT available_amount FROM users WHERE id = $1', [userId]);
        const currentBalance = parseFloat(userRes.rows[0].available_amount);

        if (currentBalance < amount) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Insufficient funds" });
        }

        // 2. Update User (Decrease available, Increase contributed)
        await client.query(`
            UPDATE users 
            SET available_amount = available_amount - $1, 
                contributed_amount = contributed_amount + $1 
            WHERE id = $2`, 
            [amount, userId]
        );

        // 3. Create Contribution Record
        // Note: Column name is contributed_amount_by_user based on your db.ts
        await client.query(`
            INSERT INTO contributions (id, user_id, category_id, contributed_amount_by_user) 
            VALUES (gen_random_uuid(), $1, (SELECT id FROM funding_categories WHERE name = 'Debt Repayment'), $2)`,
            [userId, amount]
        );

        await client.query('COMMIT');
        
        // Return updated stats
        res.json({ 
            message: "Contribution successful", 
            newBalance: currentBalance - amount 
        });
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Debt Contribution Error:", e);
        res.status(500).json({ error: "Transaction failed" });
    } finally {
        client.release();
    }
};
