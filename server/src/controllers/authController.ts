import type { Request, Response } from "express";
import { pool } from "../db.ts";
import { hashPassword, checkPasswordHash, makeJWT } from "../utils/authUtils.ts";
import { v4 as uuidv4 } from "uuid";
import { registerSchema, loginSchema } from "../validators/auth.ts";

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { email, password, username, role_id, company_name } = validatedData;
    const normalizedEmail = email.toLowerCase();

    // 1. Check existing in "users" table
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const id = uuidv4();
    const hashedPassword = await hashPassword(password);
    
    // 2. Insert into "users" table
    await pool.query(
      `INSERT INTO users (id, username, email, hashed_password, role_id, company_name) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, username, normalizedEmail, hashedPassword, role_id || 1, company_name || null]
    );

    const token = makeJWT(id, 3600);
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });

    res.status(201).json({ 
      user: { id, email: normalizedEmail, username, role_id: role_id || 1 }, 
      token 
    });
  } catch (err: any) {
    const message = err.errors ? err.errors[0].message : "Registration failed";
    res.status(400).json({ error: message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase();

    // 3. Select role_id and id from "users"
    const result = await pool.query(
      'SELECT id, username, hashed_password, role_id FROM users WHERE email = $1', 
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isMatch = await checkPasswordHash(password, user.hashed_password);
    
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = makeJWT(user.id, 3600);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    });

    // 4. Return the role_id to the frontend
    res.json({ 
        user: { 
            id: user.id, 
            email: normalizedEmail, 
            username: user.username, 
            role_id: user.role_id 
        }, 
        token 
    });
  } catch (err: any) {
    res.status(400).json({ error: err.errors?.[0]?.message || "Login failed" });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};
