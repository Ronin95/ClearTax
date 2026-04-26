import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { apiConfig } from "../config.ts";
import { pool } from "../db.ts";

// 1. Update the interface to include all columns we need on the frontend
export interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        email: string;
        tax_number: string;
        role_id: number;
        available_amount: string; // Decimals often come as strings from 'pg'
        contributed_amount: string;
    };
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, apiConfig.jwtSecret) as { sub: string };
        
        // 2. Expanded query to fetch EVERYTHING the dashboard needs
        const result = await pool.query(
            `SELECT id, username, email, tax_number, role_id, available_amount, contributed_amount 
             FROM users WHERE id = $1`,
            [decoded.sub]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "User not found." });
        }

        req.user = result.rows[0]; 
        next(); 
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token." });
    }
};
