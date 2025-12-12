/** @file JWT token utilities */
import crypto from "node:crypto";
import { isRecord } from "./guards.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TokenPayload {
  userId: string;
}

interface JWTHeader {
  alg: string;
  typ: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function base64UrlEncode(data: string): string {
  return Buffer.from(data)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(data: string): string {
  const padded = data + "=".repeat((4 - (data.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString();
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return secret;
}

function createSignature(headerB64: string, payloadB64: string): string {
  const data = `${headerB64}.${payloadB64}`;
  return crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

// ─── Type Guards ─────────────────────────────────────────────────────────────

function isTokenPayload(obj: unknown): obj is TokenPayload {
  return isRecord(obj) && typeof obj.userId === "string";
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function signToken(payload: TokenPayload): string {
  const header: JWTHeader = { alg: "HS256", typ: "JWT" };
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signature = createSignature(headerB64, payloadB64);
  return `${headerB64}.${payloadB64}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signature] = parts;
  const expectedSignature = createSignature(headerB64, payloadB64);

  if (signature !== expectedSignature) return null;

  try {
    const payload: unknown = JSON.parse(base64UrlDecode(payloadB64));
    return isTokenPayload(payload) ? payload : null;
  } catch {
    return null;
  }
}
