/** @file JWT token utilities */
import jwt, { JwtPayload } from "jsonwebtoken";

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

// ─── Public API ──────────────────────────────────────────────────────────────

const ALGORITHM = "HS256";

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getSecret(), {
    expiresIn: "7d",
    algorithm: ALGORITHM,
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret(), { algorithms: [ALGORITHM] });
    if (typeof decoded === "string") return null;
    return decoded;
  } catch {
    return null;
  }
}
