import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { apiConfig } from "../config.ts";

export const hashPassword = (password: string) => argon2.hash(password);
export const checkPasswordHash = (password: string, hash: string) => argon2.verify(hash, password);

export const makeJWT = (userID: string, expiresIn: number): string => {
  return jwt.sign({ sub: userID, iss: "cleartax" }, apiConfig.jwtSecret, { expiresIn });
};

export const makeRefreshToken = (): string => crypto.randomBytes(32).toString("hex");
