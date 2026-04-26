import type { Request, Response } from "express";
import { pool } from "../db.ts";
import { hashPassword, checkPasswordHash, makeJWT, makeRefreshToken } from "../utils/authUtils.ts";
import { v4 as uuidv4 } from "uuid";
import { registerSchema, loginSchema } from "../validators/auth.ts";

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, username, role_id, company_name, tax_number } = req.body;
        const normalizedEmail = email.toLowerCase();

        const existing = await pool.query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
        if (existing.rows.length > 0) return res.status(400).json({ error: "Email already exists" });

        const id = uuidv4();
        const hashedPassword = await hashPassword(password);
        
        await pool.query(
            `INSERT INTO users (id, username, email, tax_number, hashed_password, role_id, company_name, available_amount, contributed_amount) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, 0.00, 0.00)`,
            [id, username, normalizedEmail, tax_number, hashedPassword, role_id || 1, company_name || null]
        );

        const accessToken = makeJWT(id, 3600);
        const refreshToken = makeRefreshToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await pool.query("INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)", [refreshToken, id, expiresAt]);

        res.cookie("token", accessToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production",
            sameSite: 'lax',
            maxAge: 3600000 
        });

        return res.status(201).json({ 
            user: { id, email: normalizedEmail, username, role_id: role_id || 1, tax_number }, 
            token: accessToken 
        });
    } catch (err: any) {
        return res.status(400).json({ error: "Registration failed" });
    }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = loginSchema.parse(req.body);
    const normalizedIdentifier = identifier.toLowerCase();

    // Search for the user by email OR username
    const result = await pool.query(
      "SELECT id, username, email, hashed_password, role_id FROM users WHERE email = $1 OR username = $2", 
      [normalizedIdentifier, normalizedIdentifier]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isMatch = await checkPasswordHash(password, user.hashed_password);
    
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const accessToken = makeJWT(user.id, 3600);
    const refreshToken = makeRefreshToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.query(
      "INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)", 
      [refreshToken, user.id, expiresAt]
    );

    res.cookie("token", accessToken, { 
      httpOnly: true, 
      sameSite: 'lax', 
      maxAge: 3600000 
    });
    
    res.cookie("refreshToken", refreshToken, { 
      httpOnly: true, 
      sameSite: 'lax', 
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    return res.json({ 
        user: { 
            id: user.id, 
            email: user.email, 
            username: user.username, 
            role_id: user.role_id 
        }, 
        token: accessToken 
    });
  } catch (err: any) {
    console.error("LOGIN ERROR:", err);
    return res.status(400).json({ error: "Login failed" });
  }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    return res.json({ message: "Logged out" });
};
