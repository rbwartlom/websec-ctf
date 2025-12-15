/** @file JWT token utilities */
import jwt from "jsonwebtoken";
import { isRecord } from "./guards.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TokenPayload {
  userId: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return secret;
}

// ─── Type Guards ─────────────────────────────────────────────────────────────

function isTokenPayload(obj: unknown): obj is TokenPayload {
  return isRecord(obj) && typeof obj.userId === "string";
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded: unknown = jwt.verify(token, getSecret());
    return isTokenPayload(decoded) ? decoded : null;
  } catch {
    return null;
  }
}
